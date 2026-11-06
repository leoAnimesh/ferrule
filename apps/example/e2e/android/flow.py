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

def modal():
    section('modal')
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

def main():
    time.sleep(3)
    catalog()
    gallery()
    switches()
    section('toast')
    tap('Success')
    shot('toast')
    check('toast appears', find('Dismiss notification') is not None)
    tap('Dismiss notification')
    time.sleep(0.5)
    check('toast dismisses', find('Dismiss notification') is None)
    section('sheet')
    shot('sheet-section')
    modal()
    print('failures:', failures)
    sys.exit(1 if failures else 0)

main()
