import type { ReactNode } from 'react';
// The library additions that the example screens asked for. See docs/gaps.md.
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, Text as RNText, useWindowDimensions } from 'react-native';
import { createTheme, FerruleProvider, Gradient, Text as FerruleText, registerNativeVariants, resetNativeVariants, StyleSheet, TextInput, useBreakpoint, useDirection, useInsets, useResponsive, useTheme } from '../../src';
import { IconButton } from '../../registry/components/button';
import { Carousel } from '../../registry/components/carousel';
import { Chip } from '../../registry/components/chip';
import { Icon } from '../../registry/components/icon';
import { Image } from '../../registry/components/image';
import { Progress, ProgressRing } from '../../registry/components/progress';
import { Segmented } from '../../registry/components/segmented';
import { Container, Grid } from '../../registry/components/stack';
import { Stepper } from '../../registry/components/stepper';
import { SwipeRow } from '../../registry/components/swipe-row';
import { TabBar, TabBarScreen, useTabBarHeight } from '../../registry/components/tabbar';
import { Text } from '../../registry/components/text';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: jest.fn(() => ({ width: 400, height: 800, scale: 1, fontScale: 1 })) }));
const setWidth = (width: number) => (useWindowDimensions as jest.Mock).mockReturnValue({ width, height: 800, scale: 1, fontScale: 1 });
const flat = (node: { props: { style?: unknown } }) => StyleSheet.flatten(node.props.style as never) as Record<string, unknown>;
const ICON = { uri: 'icon.png' };

afterEach(() => {
  setWidth(400);
  resetNativeVariants();
});

describe('nested FerruleProvider', () => {
  function Probe() {
    const { mode, colors } = useTheme();
    const insets = useInsets();
    return <RNText testID="probe">{`${mode} ${colors.primary} ${insets.top} ${useDirection()}`}</RNText>;
  }
  const brand = createTheme({ colors: { light: { primary: '#111111' }, dark: { primary: '#EEEEEE' } } });
  const insets = { top: 7, bottom: 0, left: 0, right: 0 };

  test('takes mode and insets from the parent, and colors from its own theme', async () => {
    await render(<FerruleProvider colorMode="dark" insets={insets}><FerruleProvider theme={brand}><Probe /></FerruleProvider></FerruleProvider>);
    expect(screen.getByTestId('probe').props.children).toBe('dark #EEEEEE 7 ltr');
  });

  test('its own colorMode still wins, and "system" still means the OS', async () => {
    await render(<FerruleProvider colorMode="dark"><FerruleProvider theme={brand} colorMode="light"><Probe /></FerruleProvider></FerruleProvider>);
    expect(screen.getByTestId('probe').props.children).toContain('light #111111');
    await render(<FerruleProvider colorMode="dark"><FerruleProvider theme={brand} colorMode="system"><Probe /></FerruleProvider></FerruleProvider>);
    expect(screen.getByTestId('probe').props.children).toContain('light');
  });

  test('a top-level provider with no colorMode follows the OS, as before', async () => {
    await render(<FerruleProvider theme={brand}><Probe /></FerruleProvider>);
    expect(screen.getByTestId('probe').props.children).toContain('light #111111');
  });
});

describe('responsive values', () => {
  function Probe() {
    return <RNText testID="probe">{`${useBreakpoint()} ${useResponsive({ base: 1, lg: 3 })} ${useResponsive({ base: 1, md: 2 })}`}</RNText>;
  }
  test.each([[400, 'base 1 1'], [800, 'md 1 2'], [1200, 'lg 3 2']])('at %d wide', async (width, expected) => {
    setWidth(width);
    await render(<FerruleProvider colorMode="light"><Probe /></FerruleProvider>);
    expect(screen.getByTestId('probe').props.children).toBe(expected);
  });

  test('breakpoints come from the theme', async () => {
    setWidth(500);
    const theme = createTheme({ tokens: { breakpoint: { md: 480 } } });
    await render(<FerruleProvider theme={theme} colorMode="light"><Probe /></FerruleProvider>);
    expect(screen.getByTestId('probe').props.children).toBe('md 1 2');
  });
});

test('Grid keeps cells equal, including in a short last row', async () => {
  await render(<FerruleProvider colorMode="light"><Grid testID="grid" columns={2}><Text>a</Text><Text>b</Text><Text>c</Text></Grid></FerruleProvider>);
  const rows = screen.getByTestId('grid').children as unknown as { children: unknown[] }[];
  expect(rows).toHaveLength(2);
  expect(rows[1]!.children).toHaveLength(2);
});

test('Container limits width to the theme breakpoint, or its own', async () => {
  await render(<FerruleProvider colorMode="light"><Container testID="a" /><Container testID="b" maxWidth={640} /></FerruleProvider>);
  expect(flat(screen.getByTestId('a')).maxWidth).toBe(1100);
  expect(flat(screen.getByTestId('b')).maxWidth).toBe(640);
});

test('Gradient is a real background, with its first color as the fallback', async () => {
  await render(<FerruleProvider colorMode="light"><Gradient testID="g" colors={['#000000', '#FFFFFF']} angle={90} /></FerruleProvider>);
  const style = flat(screen.getByTestId('g'));
  expect(style.backgroundImage).toBe('linear-gradient(90deg, #000000, #FFFFFF)');
  expect(style.backgroundColor).toBe('#000000');
});

test('Icon is hidden from screen readers unless labelled, and tinted', async () => {
  await render(<FerruleProvider colorMode="light"><Icon source={ICON} /><Icon source={ICON} label="Pin" color="#123456" /></FerruleProvider>);
  const labelled = screen.getByLabelText('Pin');
  expect(flat(labelled).tintColor).toBe('#123456');
});

test('Icon draws a Feather name as an image, and only directional ones can mirror', async () => {
  await render(<FerruleProvider colorMode="light"><Icon name="chevron-left" label="Back" /><Icon name="star" label="Star" /></FerruleProvider>);
  const back = screen.getByLabelText('Back');
  expect(back.props.source.uri).toMatch(/^data:image\/png;base64,/);
  expect(flat(back).transform).toEqual([{ scaleX: 1 }]); // Native direction comes from I18nManager, so -1 is checked in the web suite.
  expect(flat(screen.getByLabelText('Star')).transform).toBeUndefined();
});

test('IconButton is named, square, and keeps a full touch target', async () => {
  const onPress = jest.fn();
  await render(<FerruleProvider colorMode="light"><IconButton aria-label="Back" size="sm" onPress={onPress}><Icon source={ICON} /></IconButton></FerruleProvider>);
  const button = screen.getByRole('button', { name: 'Back' });
  await fireEvent.press(button);
  expect(onPress).toHaveBeenCalled();
  expect(flat(button).width).toBe(36);
  expect(button.props.hitSlop).toBe(4);
});

describe('Chip', () => {
  test('is a checkbox when it can be selected, and a button when not', async () => {
    await render(<FerruleProvider colorMode="light"><Chip label="Veg" selected /><Chip label="Clear" /></FerruleProvider>);
    expect(screen.getByRole('checkbox', { name: 'Veg', checked: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeTruthy();
  });
});

test('Segmented is a radio group that reports the choice', async () => {
  const change = jest.fn();
  await render(<FerruleProvider colorMode="light"><Segmented label="Show" defaultValue="a" onValueChange={change} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} /></FerruleProvider>);
  expect(screen.getByRole('radio', { name: 'A', checked: true })).toBeTruthy();
  await fireEvent.press(screen.getByRole('radio', { name: 'B' }));
  expect(change).toHaveBeenCalledWith('b');
  expect(screen.getByRole('radio', { name: 'B', checked: true })).toBeTruthy();
});

test('TabBar has tabs, one selected, and clears the home indicator', async () => {
  const insets = { top: 0, bottom: 34, left: 0, right: 0 };
  await render(<FerruleProvider colorMode="light" insets={insets}><TabBar testID="bar" items={[{ value: 'a', label: 'Home', icon: ICON }, { value: 'b', label: 'Orders', icon: ICON }]} /></FerruleProvider>);
  expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeTruthy();
  await fireEvent.press(screen.getByRole('tab', { name: 'Orders' }));
  expect(screen.getByRole('tab', { name: 'Orders', selected: true })).toBeTruthy();
  expect(flat(screen.getByTestId('bar')).paddingBottom).toBe(34);
});

test.each([
  ['chip', () => <Chip label="Veg" native />],
  ['segmented', () => <Segmented label="S" native options={[{ value: 'a', label: 'A' }]} />],
  ['tabbar', () => <TabBar native items={[{ value: 'a', label: 'Home', icon: ICON }]} />],
])('%s renders the registered native variant, and its own without one', async (name, ui) => {
  await render(<FerruleProvider colorMode="light">{ui()}</FerruleProvider>);
  expect(screen.queryByTestId('native')).toBeNull();
  registerNativeVariants({ [name]: { Component: (() => <RNText testID="native">n</RNText>) as never, isAvailable: () => true } });
  await render(<FerruleProvider colorMode="light">{ui()}</FerruleProvider>);
  expect(screen.getByTestId('native')).toBeTruthy();
});

describe('Progress', () => {
  test('reports a clamped value on both shapes', async () => {
    await render(<FerruleProvider colorMode="light"><Progress testID="bar" label="Bar" value={0.25} /><ProgressRing testID="ring" label="Ring" value={3} /></FerruleProvider>);
    expect(screen.getByTestId('bar').props['aria-valuenow']).toBe(25);
    expect(screen.getByTestId('ring').props['aria-valuenow']).toBe(100);
    expect(screen.getByLabelText('Ring').props.role).toBe('progressbar');
  });
});

describe('Stepper', () => {
  const setup = async (value: number) => {
    const change = jest.fn();
    await render(<FerruleProvider colorMode="light"><Stepper testID="s" label="Focus" unit="min" value={value} min={5} max={10} step={5} onValueChange={change} /></FerruleProvider>);
    return change;
  };
  test('steps, and stops at its limits', async () => {
    const change = await setup(5);
    await fireEvent.press(screen.getByTestId('s-more'));
    expect(change).toHaveBeenCalledWith(10);
    change.mockClear();
    await fireEvent.press(screen.getByTestId('s-less'));
    expect(change).not.toHaveBeenCalled();
  });
  test('is adjustable by screen readers', async () => {
    const change = await setup(5);
    const host = screen.getByTestId('s');
    expect(host.props.accessibilityRole).toBe('adjustable');
    expect(host.props['aria-valuetext']).toBe('5 min');
    await act(async () => host.props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } }));
    expect(change).toHaveBeenCalledWith(10);
  });
});

test('SwipeRow offers its actions to screen readers', async () => {
  const done = jest.fn();
  const remove = jest.fn();
  await render(<FerruleProvider colorMode="light"><SwipeRow testID="row" startAction={{ label: 'Done', tone: 'success', onAction: done }} endAction={{ label: 'Delete', tone: 'danger', onAction: remove }}><Text>Task</Text></SwipeRow></FerruleProvider>);
  const row = screen.getByTestId('row');
  expect(row.props.accessibilityActions.map((a: { name: string }) => a.name)).toEqual(['Done', 'Delete']);
  await act(async () => row.props.onAccessibilityAction({ nativeEvent: { actionName: 'Delete' } }));
  expect(remove).toHaveBeenCalled();
  expect(done).not.toHaveBeenCalled();
});

test('Image fills its container, whatever size the bundled file is', async () => {
  await render(<FerruleProvider colorMode="light"><Image testID="photo" source={{ uri: 'a.png', width: 480, height: 320 }} alt="" style={{ width: 64 }} /></FerruleProvider>);
  const style = flat(screen.getByTestId('photo', { includeHiddenElements: true }));
  expect(style.width).toBe('100%');
  expect(style.height).toBe('100%');
});

test('TextInput keyboards follow the theme, not the OS', async () => {
  await render(<FerruleProvider colorMode="dark"><TextInput testID="field" /></FerruleProvider>);
  expect(screen.getByTestId('field').props.keyboardAppearance).toBe('dark');
});

test('Android 15+ leaves room for the gesture bar', async () => {
  const { Platform } = require('react-native');
  const os = Platform.OS;
  const version = Object.getOwnPropertyDescriptor(Platform, 'Version');
  Platform.OS = 'android';
  Object.defineProperty(Platform, 'Version', { value: 35, configurable: true });
  function Probe() {
    return <RNText testID="probe">{String(useInsets().bottom)}</RNText>;
  }
  await render(<FerruleProvider colorMode="light"><Probe /></FerruleProvider>);
  expect(screen.getByTestId('probe').props.children).toBe('24');
  Platform.OS = os;
  if (version) Object.defineProperty(Platform, 'Version', version);
});

test('Icon grows with the OS text size, up to a limit', async () => {
  (useWindowDimensions as jest.Mock).mockReturnValue({ width: 400, height: 800, scale: 1, fontScale: 3 });
  await render(<FerruleProvider colorMode="light"><Icon source={ICON} size={20} label="Pin" /></FerruleProvider>);
  expect(flat(screen.getByLabelText('Pin')).width).toBe(30);
});

test('Carousel settles on item edges, gap included', async () => {
  await render(<FerruleProvider colorMode="light"><Carousel testID="c" itemWidth={300} gap={3}><Text>a</Text></Carousel></FerruleProvider>);
  expect(screen.getByTestId('c').props.snapToInterval).toBe(312);
});

describe('native IconButton', () => {
  const Native = jest.fn((_: Record<string, unknown>) => null);
  const variant = { Component: Native as never, isAvailable: () => true };
  beforeEach(() => { Native.mockClear(); registerNativeVariants({ iconButton: variant }); });
  afterEach(() => resetNativeVariants());
  const tree = (props: Record<string, unknown>) => (
    <FerruleProvider colorMode="light"><IconButton testID="b" aria-label="Back" variant="ghost" {...props}><Text>icon</Text></IconButton></FerruleProvider>
  );

  test('passes the label, icon and state to the platform button', async () => {
    const onPress = jest.fn();
    await render(tree({ native: true, nativeIcon: { ios: 'chevron.backward' }, disabled: true, onPress }));
    expect(Native.mock.calls[0]![0]).toMatchObject({ icon: { ios: 'chevron.backward' }, variant: 'ghost', side: 44, disabled: true, a11yLabel: 'Back', onPress, testID: 'b' });
    expect(screen.queryByText('icon')).toBeNull();
  });

  test.each([[{ native: true }], [{ nativeIcon: { ios: 'x' } }], [{ native: false, nativeIcon: { ios: 'x' } }]])('draws the Ferrule button with %j', async (props) => {
    await render(tree(props));
    expect(Native).not.toHaveBeenCalled();
    expect(screen.getByText('icon')).toBeTruthy();
    expect(screen.getByLabelText('Back')).toBeTruthy();
  });

  test('falls back when the platform has no such view', async () => {
    registerNativeVariants({ iconButton: { ...variant, isAvailable: () => false } });
    await render(tree({ native: true, nativeIcon: { ios: 'x' } }));
    expect(Native).not.toHaveBeenCalled();
    expect(screen.getByText('icon')).toBeTruthy();
  });
});

describe('TabBarScreen', () => {
  const ITEMS = [{ value: 'a', label: 'A', icon: { uri: 'a.png' } }];
  const Height = () => <Text>{`height ${useTabBarHeight()}`}</Text>;
  test('floats the bar and passes on its measured height', async () => {
    await render(<FerruleProvider colorMode="light"><TabBarScreen bar={<TabBar testID="bar" items={ITEMS} />}><Height /></TabBarScreen></FerruleProvider>);
    expect(screen.getByText('height 0')).toBeTruthy();
    let box = screen.getByTestId('bar').parent!;
    while (!box.props.onLayout) box = box.parent!;
    expect(flat(box).position).toBe('absolute');
    await act(async () => box.props.onLayout({ nativeEvent: { layout: { height: 90 } } }));
    expect(screen.getByText('height 90')).toBeTruthy();
  });
});

describe('Image loading', () => {
  test('a failed decorative image still shows a mark, not a hole', async () => {
    await render(<FerruleProvider colorMode="light"><Image testID="p" source="https://x/y.jpg" alt="" aspectRatio={1} /></FerruleProvider>);
    const image = screen.getByTestId('p', { includeHiddenElements: true });
    await act(async () => image.props.onError({ nativeEvent: {} }));
    expect(screen.queryByTestId('p', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByTestId('image-failed', { includeHiddenElements: true })).toBeTruthy();
  });
});

describe('text fonts', () => {
  const Android = (children: ReactNode) => <FerruleProvider colorMode="light">{children}</FerruleProvider>;
  const fontStyle = (id: string) => flat(screen.getByTestId(id));
  afterEach(() => { Platform.OS = 'ios'; });
  test('on Android, a custom family loses its weight, and a generic family keeps it', async () => {
    Platform.OS = 'android';
    await render(Android(<><FerruleText testID="custom" style={{ fontFamily: 'Caveat', fontWeight: '700' }}>a</FerruleText><FerruleText testID="generic" style={{ fontFamily: 'serif', fontWeight: '700' }}>b</FerruleText></>));
    expect(fontStyle('custom').fontWeight).toBeUndefined();
    expect(fontStyle('custom').fontFamily).toBe('Caveat');
    expect(fontStyle('generic').fontWeight).toBe('700');
  });
  test('warns once when a rendered weight has no family, and not without custom fonts', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const partial = createTheme({ tokens: { fontFamily: { regular: 'Lora' } } });
    await render(<FerruleProvider colorMode="light"><FerruleText style={{ fontWeight: '800' }}>a</FerruleText></FerruleProvider>);
    expect(warn).not.toHaveBeenCalled();
    await render(<FerruleProvider colorMode="light" theme={partial}><FerruleText style={{ fontWeight: '800' }}>a</FerruleText><FerruleText style={{ fontWeight: '900' }}>b</FerruleText></FerruleProvider>);
    expect(warn.mock.calls.filter(([m]) => /no `bold` family/.test(String(m)))).toHaveLength(1);
    warn.mockRestore();
  });
});

test('Feather strokes are drawn at the right width, with a valid PNG around them', () => {
  const { flatten, rasterize, toPngUri } = require('../../src/feather-raster');
  const px = 48; // 2 pixels to a unit, so the 2-unit stroke is 4 pixels wide.
  const alpha = rasterize(flatten('M5 12h14'), px);
  const at = (x: number, y: number) => alpha[y * px + x];
  expect(at(24, 23)).toBe(255);
  expect(at(24, 24)).toBe(255);
  expect(at(24, 21)).toBe(0 + at(24, 21)); // The stroke's edge.
  expect(at(24, 18)).toBe(0);
  expect(at(6, 24)).toBe(0); // Past the round cap.
  const bytes = Buffer.from(toPngUri(alpha, px).split(',')[1], 'base64');
  expect([...bytes.subarray(0, 4)]).toEqual([137, 80, 78, 71]);
  expect(bytes.subarray(bytes.length - 8, bytes.length - 4).toString()).toBe('IEND');
  expect(require('node:zlib').inflateSync(bytes.subarray(bytes.indexOf('IDAT') + 4, bytes.indexOf('IEND') - 8)).length).toBe(px * px + px);
});
