#!/usr/bin/env python3
"""Real device flow on Android: taps, hardware back, and screenshots. Usage: flow.py <screenshot-dir>. Needs Metro and the installed harness."""
import re, subprocess, sys, time, xml.etree.ElementTree as ET

SHOTS = sys.argv[1]
failures = []

def adb(*args):
    return subprocess.run(['adb', *args], capture_output=True, text=True, timeout=60).stdout

def nodes():
    adb('shell', 'uiautomator', 'dump', '/sdcard/ui.xml')
    return list(ET.fromstring(adb('exec-out', 'cat', '/sdcard/ui.xml')).iter('node'))

def find(match):
    for node in nodes():
        if match in (node.get('resource-id'), node.get('content-desc'), node.get('text')):
            return node
    return None

def center(node):
    a, b, c, d = map(int, re.findall(r'\d+', node.get('bounds')))
    return (a + c) // 2, (b + d) // 2

def tap(match):
    node = find(match)
    if node is None:
        raise RuntimeError(f'not on screen: {match}')
    x, y = center(node)
    adb('shell', 'input', 'tap', str(x), str(y))
    time.sleep(0.8)

def check(name, ok):
    print(('PASS ' if ok else 'FAIL ') + name)
    if not ok:
        failures.append(name)

def shot(name):
    with open(f'{SHOTS}/android-{name}.png', 'wb') as out:
        out.write(subprocess.run(['adb', 'exec-out', 'screencap', '-p'], capture_output=True).stdout)

def link(query):
    adb('shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'dev.ferrule.harness://?' + query.replace('&', '\\&'), 'dev.ferrule.harness')
    time.sleep(2)

def section(name):
    link(f'component={name}')

def tap_at(point):
    adb('shell', 'input', 'tap', str(point[0]), str(point[1]))
    time.sleep(1)

def gallery():
    # The composite has a spinner, so nothing here dumps the tree.
    for palette in ['verdigris', 'cobalt', 'saffron', 'custom']:
        for mode in ['light', 'dark']:
            link(f'component=composite&palette={palette}&mode={mode}')
            shot(f'gallery-{palette}-{mode}')
    link('palette=verdigris&mode=light')

def catalog():
    link('component=')
    check('catalog renders', find('catalog-search') is not None)
    shot('catalog')
    tap('catalog-search')
    adb('shell', 'input', 'text', 'swipe')
    time.sleep(1)
    check('search finds a match', find('open-swipe-row') is not None)
    check('search hides the rest', find('open-button') is None)
    adb('shell', 'input', 'keyevent', 'KEYCODE_BACK')
    link('component=switch')
    check('a deep link opens a component', find('detail-switch') is not None)
    adb('shell', 'input', 'keyevent', 'KEYCODE_BACK')
    time.sleep(1)
    check('hardware back returns to the list', find('catalog-search') is not None)
    tap('controls-open')
    tap('palette-cobalt')
    tap('Dark')
    adb('shell', 'input', 'keyevent', 'KEYCODE_BACK')
    time.sleep(1.5)
    summary = find('settings-summary')
    label = (summary.get('text') or '') if summary is not None else ''
    check(f'controls apply: {label}', 'cobalt' in label and 'dark' in label)
    link('palette=verdigris&mode=light')

def switches():
    section('switch')
    node = next(n for n in nodes() if n.get('class', '').endswith('Switch'))
    before = node.get('checked')
    x, y = center(node)
    adb('shell', 'input', 'tap', str(x), str(y))
    time.sleep(0.8)
    after = next(n for n in nodes() if n.get('bounds') == node.get('bounds')).get('checked')
    check('switch toggles by touch and reports checked', before != after)
    shot('switch')

def above_keyboard(where):
    tap('With input and keyboard')
    time.sleep(1)
    # The field itself: its label has the same text, and tapping that does not focus it.
    field = next(node for node in nodes() if node.get('class') == 'android.widget.EditText')
    x, y = center(field)
    adb('shell', 'input', 'tap', str(x), str(y))
    time.sleep(2)
    adb('shell', 'input', 'text', 'hi')
    time.sleep(1)
    shot(f'{where}-keyboard')
    check(f'{where} field shows what was typed', find('hi') is not None)
    # Under the keyboard, this tap would type a letter and it would stay open.
    tap('Save')
    time.sleep(1)
    check(f'{where} footer stays above the keyboard', find('Save') is None)
    time.sleep(1)
    shot(f'{where}-keyboard-closed')

def modal():
    section('modal')
    above_keyboard('modal')
    tap('Basic')
    check('modal opens', find('Close') is not None)
    shot('modal')
    adb('shell', 'input', 'keyevent', 'KEYCODE_BACK')
    time.sleep(1)
    check('hardware back closes the modal', find('Close') is None)
    tap('Basic')
    time.sleep(1.5)
    tap_at((540, 250))  # The backdrop, above the centered dialog.
    time.sleep(1.5)
    check('backdrop closes the modal', find('Close') is None)
    tap('Non-dismissible')
    adb('shell', 'input', 'keyevent', 'KEYCODE_BACK')
    time.sleep(1)
    check('hardware back does not close a non-dismissible modal', find('Non-dismissible') is None or find('Close') is not None)
    shot('modal-nondismissible')
    tap('I choose')

def top_of(match):
    node = find(match)
    return None if node is None else int(re.findall(r'\d+', node.get('bounds'))[1])

def scroll_to(match):
    for _ in range(6):
        if find(match) is not None:
            return
        adb('shell', 'input', 'swipe', '540', '1800', '540', '700', '300')
        time.sleep(0.8)

def toast_options():
    link('component=toast&native=0')
    scroll_to('Top')
    height = int(re.findall(r'\d+', nodes()[0].get('bounds'))[3])
    tap('Top')
    time.sleep(1)
    y = top_of('Top toast')
    check(f'a top toast sits at the top, y={y} of {height}', y is not None and y < height / 4)
    shot('toast-top')
    tap('Dismiss notification')
    time.sleep(0.5)
    check('top toast dismisses', find('Top toast') is None)
    tap('Bottom')
    time.sleep(1)
    y = top_of('Bottom toast')
    check(f'a bottom toast sits at the bottom, y={y} of {height}', y is not None and y > height * 3 / 4)
    shot('toast-bottom')
    tap('Dismiss notification')
    time.sleep(0.5)
    scroll_to('4 seconds')
    tap('4 seconds')
    check('a 4 second toast shows', find('Four seconds') is not None)
    time.sleep(5)
    check('and auto-dismisses', find('Four seconds') is None)

def segmented_slide():
    link('component=segmented&native=0')
    shot('segmented-before')
    tap('Large')
    time.sleep(1)
    check('segmented selects by touch', find('Controlled: l') is not None)
    shot('segmented-after')

def main():
    time.sleep(3)
    toast_options()
    segmented_slide()
    catalog()
    gallery()
    switches()
    section('toast')
    # Persistent, because a slow device can spend a default toast's five seconds on these dumps.
    tap('Persistent')
    shot('toast')
    check('toast appears', find('Dismiss notification') is not None)
    tap('Dismiss notification')
    time.sleep(0.5)
    check('toast dismisses', find('Dismiss notification') is None)
    section('sheet')
    shot('sheet-section')
    above_keyboard('sheet')
    modal()
    print('failures:', failures)
    sys.exit(1 if failures else 0)

main()
