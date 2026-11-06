#!/usr/bin/env python3
"""Native variants and the FlatList demo on Android, with real taps. Usage: native.py <screenshot-dir>. Needs Metro on 8090."""
import re, subprocess, sys, time, xml.etree.ElementTree as ET

SHOTS = sys.argv[1]
failures = []

def adb(*args):
    return subprocess.run(['adb', *args], capture_output=True, text=True, timeout=120).stdout

def nodes():
    for _ in range(4):
        adb('shell', 'rm', '-f', '/sdcard/ui.xml')
        adb('shell', 'uiautomator', 'dump', '/sdcard/ui.xml')
        raw = adb('exec-out', 'cat', '/sdcard/ui.xml')
        if raw.startswith('<?xml'):
            found = list(ET.fromstring(raw).iter('node'))
            # The emulator shows ANR dialogs for other apps under load. They would swallow every tap.
            wait_button = next((n for n in found if n.get('text') == 'Wait' and n.get('package') == 'android'), None)
            if wait_button is None:
                wait_button = next((n for n in found if n.get('text') == 'Wait'), None) if any("isn't responding" in (n.get('text') or '') for n in found) else None
            if wait_button is not None:
                x, y = center(wait_button)
                adb('shell', 'input', 'tap', str(x), str(y))
                time.sleep(2)
                continue
            return found
        time.sleep(1)
    return []

def find(match, contains=False):
    for node in nodes():
        for value in (node.get('resource-id'), node.get('content-desc'), node.get('text')):
            if value and (match in value if contains else match == value):
                return node
    return None

def center(node):
    a, b, c, d = map(int, re.findall(r'\d+', node.get('bounds')))
    return (a + c) // 2, (b + d) // 2

def tap(match, contains=False):
    node = find(match, contains)
    if node is None:
        check(f'on screen: {match}', False)
        return False
    x, y = center(node)
    adb('shell', 'input', 'tap', str(x), str(y))
    time.sleep(1.2)
    return True

def check(name, ok):
    print(('PASS ' if ok else 'FAIL ') + name, flush=True)
    if not ok:
        failures.append(name)

def wait(match, contains=True, seconds=8):
    end = time.time() + seconds
    while time.time() < end:
        if find(match, contains) is not None:
            return True
        time.sleep(1)
    return False

def shot(name):
    with open(f'{SHOTS}/android-{name}.png', 'wb') as out:
        out.write(subprocess.run(['adb', 'exec-out', 'screencap', '-p'], capture_output=True, timeout=60).stdout)

DEMOS = {
    'button': ('button', 'native-button'), 'buttonloading': ('button', 'native-button-loading'), 'switch': ('switch', 'native-switch'),
    'checkbox': ('checkbox', 'native-checkbox'), 'input': ('input', 'native-input'), 'spinner': ('spinner', 'native-progress'),
    'modal': ('modal', 'native-alert'), 'sheet': ('sheet', 'native-sheet'), 'glass': ('card', 'native-glass'), 'segmented': ('segmented', 'native-segmented'),
    'tabbar': ('tabbar', 'native-tabbar'), 'chip': ('chip', 'native-chip'),
    'slider': ('native-slider', None), 'picker': ('native-picker', None), 'menu': ('native-menu', None), 'date': ('native-date', None),
    'actionsheet': ('native-action-sheet', None), 'topbar': ('native-top-bar', None), 'search': ('native-search', None), 'fab': ('native-fab', None), 'list': ('native-list', None),
}

def link(query):
    adb('shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'dev.ferrule.harness://?' + query.replace('&', '\\&'), 'dev.ferrule.harness')
    time.sleep(2)

def demo(name, native=1):
    component, only = DEMOS[name]
    link(f'component={component}&native={native}' + (f'&only={only}' if only else ''))

def swipe(a, b, c, d, ms=300):
    adb('shell', 'input', 'swipe', str(a), str(b), str(c), str(d), str(ms))

def native_flow():
    demo('button'); wait('Solid', False, 60); shot('native-button')
    tap('Solid'); check('button press event', wait('button pressed'))
    demo('button', 0); check('native off is labelled', wait('Ferrule, native off')); shot('native-button-ferrule')
    demo('buttonloading'); time.sleep(2); shot('native-button-loading')
    demo('switch'); wait('Wi-Fi', False); shot('native-switch-on')
    tap('Wi-Fi'); check('switch event', wait('switch false')); shot('native-switch')
    demo('checkbox'); wait('Android has', True); shot('native-checkbox')
    demo('input'); wait('Email', False); shot('native-input')
    tap('Email'); adb('shell', 'input', 'text', 'hi'); check('text field event', wait('typed hi')); shot('native-input-typed'); adb('shell', 'input', 'keyevent', '4')
    demo('spinner'); time.sleep(2); shot('native-progress')
    demo('modal'); wait('open-modal'); tap('open-modal'); check('system alert', wait('Delete this file?')); shot('native-alert')
    tap('Delete'); check('alert action', wait('alert delete'))
    demo('sheet'); wait('open-sheet'); tap('open-sheet'); check('bottom sheet', wait('Copy link')); time.sleep(1); shot('native-sheet')
    tap('Copy link'); check('sheet action', wait('sheet copy'))
    demo('slider'); time.sleep(2); shot('native-slider')
    node = find('n-slider')
    node = node if node is not None else find('Volume')
    if node is not None:
        a, b, c, d = map(int, re.findall(r'\d+', node.get('bounds')))
        adb('shell', 'input', 'tap', str(a + (c - a) * 4 // 5), str((b + d) // 2))
        check('slider event', wait('slider'))
    else:
        check('slider on screen', False)
    demo('glass'); time.sleep(2); shot('native-glass-fallback')
    demo('segmented'); wait('Large', False); tap('Large'); check('segmented event', wait('segment l')); shot('native-segmented')
    demo('picker'); time.sleep(2); tap('Medium', False); time.sleep(1); shot('native-picker'); check('picker opens', find('Large', False) is not None); adb('shell', 'input', 'keyevent', '4')
    demo('menu'); wait('Actions', False); tap('Actions'); check('menu opens', wait('Share', False)); shot('native-menu'); tap('Share'); check('menu event', wait('menu share'))
    demo('date'); time.sleep(2); shot('native-date')
    tap('Date', True)
    demo('actionsheet'); wait('open-action'); tap('open-action'); check('action sheet', wait('Take photo')); time.sleep(1); shot('native-actionsheet'); tap('Take photo')
    demo('tabbar'); wait('Profile', False); tap('Profile'); check('tab event', wait('tab me')); shot('native-tabbar')
    demo('topbar'); wait('Inbox', False); shot('native-topbar'); tap('Search', False); check('top bar event', wait('bar search'))
    demo('search'); time.sleep(2); shot('native-search')
    demo('chip'); wait('Selected', False); shot('native-chip')
    demo('fab'); wait('Compose', False); shot('native-fab'); tap('Add', False); check('fab event', wait('event: fab'))
    demo('list'); wait('Second row', False); shot('native-list'); tap('Second row'); check('list event', wait('row b'))

def list_flow():
    link('component=flatlist')
    check('first row', wait('row-0', False, 60))
    shot('flatlist-top')
    box = next(n for n in nodes() if n.get('resource-id') == 'flatlist')
    a, b, c, d = map(int, re.findall(r'\d+', box.get('bounds')))
    swipe((a + c) // 2, d - 220, (a + c) // 2, b + 80, 200); time.sleep(3); shot('flatlist-scrolled')
    check('a swipe scrolls the list', find('row-0') is None)
    tap('to-index'); time.sleep(3); check('scrollToIndex', find('row-150') is not None)
    tap('to-end'); time.sleep(3); check('scrollToEnd', find('list-footer') is not None)
    tap('to-top'); time.sleep(3); check('scrollToOffset', find('row-0') is not None)

def real_or_fallback():
    # Android has no native glass, so the status badge has to say so.
    demo('button'); check('button says native view', wait('Native view'))
    link('component=button&native=1&only=native-icon-button'); check('icon button says fallback', wait('Fallback on android'))

for part in sys.argv[2:] or ['native', 'list', 'status']:
    {'native': native_flow, 'list': list_flow, 'status': real_or_fallback}[part]()
print('FAILURES:', failures or 'none')
sys.exit(1 if failures else 0)
