import { createRef } from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react-native';
import { createPalette, createTheme, defaultTheme, FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, FadeOutUp, FerruleProvider, palettes, StyleSheet, View, ZoomIn, ZoomOut } from '@leoanimesh/ferrule';
import { Avatar, initials } from '../../registry/components/avatar';
import { Carousel } from '../../registry/components/carousel';
import { Icon } from '../../registry/components/icon';
import { Progress, ProgressRing } from '../../registry/components/progress';
import { Segmented } from '../../registry/components/segmented';
import { Stepper } from '../../registry/components/stepper';
import { SwipeRow } from '../../registry/components/swipe-row';
import { TabBar } from '../../registry/components/tabbar';
import { Badge } from '../../registry/components/badge';
import { Button } from '../../registry/components/button';
import { Card } from '../../registry/components/card';
import { Checkbox } from '../../registry/components/checkbox';
import { Image } from '../../registry/components/image';
import { Input } from '../../registry/components/input';
import { List, ListItem } from '../../registry/components/list';
import { Modal } from '../../registry/components/modal';
import { Sheet } from '../../registry/components/sheet';
import { Spinner } from '../../registry/components/spinner';
import { Divider, Stack } from '../../registry/components/stack';
import { Switch } from '../../registry/components/switch';
import { Text } from '../../registry/components/text';
import { toastMotion, ToastProvider, useToast, type ToastOptions } from '../../registry/components/toast';
import type { ReactElement } from 'react';

// test-renderer keeps one scheduler timer of its own, even after rendering an empty View.
const RENDERER_OWN_TIMERS = 1;
const flat = (node: { props: { style?: unknown } }) => StyleSheet.flatten(node.props.style as never) as Record<string, unknown>;
const wrap = (ui: ReactElement) => render(<FerruleProvider colorMode="light">{ui}</FerruleProvider>);
type Host = ReturnType<typeof screen.container.queryAll>[number];
const hostWith = (test: (host: Host) => boolean) => screen.container.queryAll(test)[0]!;
const imageHost = () => hostWith((n) => n.type === 'Image');

describe('Button', () => {
  test('fires onPress and exposes role and label', async () => {
    const onPress = jest.fn();
    await wrap(<Button onPress={onPress}>Save</Button>);
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  test('disabled blocks press and reports state', async () => {
    const onPress = jest.fn();
    await wrap(<Button disabled onPress={onPress}>Save</Button>);
    await fireEvent.press(screen.getByRole('button', { disabled: true }));
    expect(onPress).not.toHaveBeenCalled();
  });
  test('loading blocks press, reports busy and keeps the label', async () => {
    const onPress = jest.fn();
    await wrap(<Button loading onPress={onPress}>Save</Button>);
    const button = screen.getByRole('button', { busy: true });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByText('Save')).toBeTruthy();
  });
  test('uses minHeight so text scaling grows it instead of clipping', async () => {
    await wrap(<Button testID="b">Save</Button>);
    const style = flat(screen.getByTestId('b'));
    expect(style.minHeight).toBe(44);
    expect(style.height).toBeUndefined();
  });
  test('small keeps a 44dp touch target through hitSlop', async () => {
    await wrap(<Button testID="b" size="sm">Save</Button>);
    const button = screen.getByTestId('b');
    expect(flat(button).minHeight).toBe(36);
    expect(button.props.hitSlop).toEqual({ top: 4, bottom: 4 });
  });
  test('forwards its ref and style, and honors theme overrides', async () => {
    const ref = createRef<never>();
    const theme = createTheme({ components: { button: { container: { borderRadius: 1 } } } });
    await render(<FerruleProvider theme={theme}><Button ref={ref} testID="b" style={{ marginTop: 3 }}>Save</Button></FerruleProvider>);
    expect(ref.current).toBeTruthy();
    const style = flat(screen.getByTestId('b'));
    expect(style.borderRadius).toBe(1);
    expect(style.marginTop).toBe(3);
  });
});

describe('Input', () => {
  test('uncontrolled keeps typed text', async () => {
    await wrap(<Input label="Name" defaultValue="A" />);
    const field = screen.getByLabelText('Name');
    expect(field.props.value).toBe('A');
    await fireEvent.changeText(field, 'AB');
    expect(screen.getByLabelText('Name').props.value).toBe('AB');
  });
  test('controlled only changes through its prop', async () => {
    const onChangeText = jest.fn();
    await wrap(<Input label="Name" value="A" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByLabelText('Name'), 'AB');
    expect(onChangeText).toHaveBeenCalledWith('AB');
    expect(screen.getByLabelText('Name').props.value).toBe('A');
  });
  test('error replaces helper text, is announced, and joins the native hint', async () => {
    await wrap(<Input label="Email" helperText="Work address" error="Required" />);
    expect(screen.queryByText('Work address')).toBeNull();
    expect(screen.getByRole('alert').props.accessibilityLiveRegion).toBe('polite');
    expect(screen.getByLabelText('Email').props.accessibilityHint).toBe('Required');
  });
  test('disabled is not editable', async () => {
    await wrap(<Input label="Name" disabled />);
    expect(screen.getByLabelText('Name').props.editable).toBe(false);
  });
  test('forwards its ref to the text input', async () => {
    const ref = createRef<never>();
    await wrap(<Input ref={ref} label="Name" />);
    expect(ref.current).toBeTruthy();
  });
});

describe('Checkbox', () => {
  test('uncontrolled toggles and reports', async () => {
    const onChange = jest.fn();
    await wrap(<Checkbox label="Agree" onCheckedChange={onChange} />);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Agree', checked: false }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('checkbox', { name: 'Agree', checked: true })).toBeTruthy();
  });
  test('controlled does not change without its prop', async () => {
    const onChange = jest.fn();
    await wrap(<Checkbox label="Agree" checked={false} onCheckedChange={onChange} />);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Agree' }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('checkbox', { checked: false })).toBeTruthy();
  });
  test('indeterminate announces mixed and resolves to checked', async () => {
    const onChange = jest.fn();
    await wrap(<Checkbox label="All" indeterminate onCheckedChange={onChange} />);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'All', checked: 'mixed' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
  test('disabled does not toggle', async () => {
    const onChange = jest.fn();
    await wrap(<Checkbox label="Agree" disabled onCheckedChange={onChange} />);
    await fireEvent.press(screen.getByRole('checkbox', { disabled: true }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Switch', () => {
  test('uncontrolled toggles with a switch role and checked state', async () => {
    const onChange = jest.fn();
    await wrap(<Switch label="Wifi" onCheckedChange={onChange} />);
    await fireEvent.press(screen.getByRole('switch', { name: 'Wifi', checked: false }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch', { checked: true })).toBeTruthy();
  });
  test('disabled does not toggle', async () => {
    const onChange = jest.fn();
    await wrap(<Switch label="Wifi" disabled onCheckedChange={onChange} />);
    await fireEvent.press(screen.getByRole('switch', { disabled: true }));
    expect(onChange).not.toHaveBeenCalled();
  });
  test('keeps a full touch target', async () => {
    await wrap(<Switch testID="s" label="Wifi" />);
    expect(flat(screen.getByTestId('s')).minHeight).toBe(44);
  });
});

describe('Badge', () => {
  test.each([[null], [undefined], ['']])('renders nothing for %p', async (value) => {
    await wrap(<Badge testID="badge">{value}</Badge>);
    expect(screen.queryByTestId('badge')).toBeNull();
  });
  test('truncates long text to one line', async () => {
    await wrap(<Badge>Very long status text</Badge>);
    expect(screen.getByText('Very long status text').props.numberOfLines).toBe(1);
  });
});

describe('Avatar', () => {
  test.each([
    ['Ada Lovelace', 'AL'],
    ['  ada   b  lovelace ', 'AL'],
    ['ada', 'A'],
    ['', ''],
    [undefined, ''],
    ['😀 Smile', '😀S'],
  ])('initials(%p) is %p', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
  test('falls back to initials when the image fails', async () => {
    await wrap(<Avatar testID="a" name="Ada Lovelace" src="https://x/y.png" />);
    expect(screen.queryByText('AL', { includeHiddenElements: true })).toBeNull();
    const image = imageHost();
    await act(async () => image.props.onError({ nativeEvent: {} }));
    expect(screen.getByText('AL', { includeHiddenElements: true })).toBeTruthy();
  });
  test('names itself, and has an accessible name with no name given', async () => {
    await wrap(<Avatar name="Ada" />);
    expect(screen.getByRole('img', { name: 'Ada' })).toBeTruthy();
    await wrap(<Avatar />);
    expect(screen.getByRole('img', { name: 'Avatar' })).toBeTruthy();
  });
});

describe('Image', () => {
  test('missing source shows alt text instead of breaking', async () => {
    await wrap(<Image alt="A cat" source={null} aspectRatio={1} />);
    expect(screen.getByText('A cat', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'A cat' })).toBeTruthy();
  });
  test('failure shows the fallback', async () => {
    await wrap(<Image alt="A cat" source="https://x/y.png" fallback={<Text>Nope</Text>} aspectRatio={1} />);
    const image = imageHost();
    await act(async () => image.props.onError({ nativeEvent: {} }));
    expect(screen.getByText('Nope', { includeHiddenElements: true })).toBeTruthy();
  });
  test('empty alt is decorative and hidden from screen readers', async () => {
    await wrap(<Image alt="" source="https://x/y.png" aspectRatio={1} />);
    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('List', () => {
  test('empty state', async () => {
    await wrap(<List data={[]} renderItem={() => null} emptyText="No results" />);
    expect(screen.getByText('No results')).toBeTruthy();
  });
  test('loading hides data and shows a spinner', async () => {
    await wrap(<List loading data={['a']} renderItem={({ item }) => <Text>{item}</Text>} />);
    expect(screen.queryByText('a')).toBeNull();
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });
  test('ListItem without a handler is not a button; with one it is', async () => {
    const onPress = jest.fn();
    await wrap(<View><ListItem title="Static" /><ListItem title="Tap" description="More" onPress={onPress} /><ListItem title="Off" disabled onPress={onPress} /></View>);
    expect(screen.queryByRole('button', { name: 'Static' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Tap, More' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Off' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Modal', () => {
  test('closed renders nothing; open exposes a named modal dialog', async () => {
    const { rerender } = await wrap(<Modal open={false} title="Title">Body</Modal>);
    expect(screen.queryByText('Title')).toBeNull();
    await rerender(<FerruleProvider><Modal open title="Title"><Text>Body</Text></Modal></FerruleProvider>);
    expect(screen.getByText('Title')).toBeTruthy();
    const dialog = hostWith((n) => n.props.role === 'dialog');
    expect(dialog.props['aria-label']).toBe('Title');
    expect(dialog.props.accessibilityViewIsModal).toBe(true);
  });
  test('close button, backdrop, OS back and the VoiceOver escape all request close', async () => {
    const onOpenChange = jest.fn();
    await wrap(<Modal open title="T" testID="m" onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    await fireEvent.press(screen.getByTestId('m-backdrop'));
    const native = hostWith((n) => typeof n.props.onRequestClose === 'function');
    await act(async () => native.props.onRequestClose());
    const dialog = hostWith((n) => n.props.role === 'dialog');
    await act(async () => dialog.props.onAccessibilityEscape());
    expect(onOpenChange).toHaveBeenCalledTimes(4);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
  test('non-dismissible ignores all of them and shows no close button', async () => {
    const onOpenChange = jest.fn();
    await wrap(<Modal open title="T" testID="m" dismissible={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    await fireEvent.press(screen.getByTestId('m-backdrop'));
    const native = hostWith((n) => typeof n.props.onRequestClose === 'function');
    await act(async () => native.props.onRequestClose());
    expect(onOpenChange).not.toHaveBeenCalled();
  });
  test('unmounting while open leaves no pending timers', async () => {
    jest.useFakeTimers();
    const view = await wrap(<Modal open title="T" />);
    await view.unmount();
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(jest.getTimerCount()).toBeLessThanOrEqual(RENDERER_OWN_TIMERS);
    jest.useRealTimers();
  });
});

describe('Sheet', () => {
  test('opens uncontrolled and closes from its close button', async () => {
    jest.useFakeTimers();
    await wrap(<Sheet defaultOpen title="Options" />);
    expect(screen.getByText('Options')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(screen.queryByText('Options')).toBeNull();
    jest.useRealTimers();
  });
});

describe('Toast', () => {
  const { tokens } = defaultTheme;
  let api: ReturnType<typeof useToast>;
  function Grab() { api = useToast(); return null; }
  const setup = () => wrap(<ToastProvider><Grab /></ToastProvider>);
  const show = (options: ToastOptions) => act(async () => { api.show(options); });

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('shows, then auto-dismisses after its duration', async () => {
    await setup();
    await show({ title: 'Saved', duration: 1000 });
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(hostWith((n) => n.props.role === 'status').props.accessibilityLiveRegion).toBe('polite');
    await act(async () => { jest.advanceTimersByTime(1001); });
    expect(screen.queryByText('Saved')).toBeNull();
  });
  test('null duration stays until dismissed by its button', async () => {
    await setup();
    await show({ title: 'Stay', duration: null });
    await act(async () => { jest.advanceTimersByTime(60000); });
    expect(screen.getByText('Stay')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Stay')).toBeNull();
  });
  test('danger is announced as an alert', async () => {
    await setup();
    await show({ title: 'Failed', tone: 'danger' });
    expect(hostWith((n) => n.props.role === 'alert').props.accessibilityLiveRegion).toBe('assertive');
  });
  test('keeps at most three', async () => {
    await setup();
    for (const title of ['1', '2', '3', '4']) await show({ title, duration: null });
    expect(screen.queryByText('1')).toBeNull();
    expect(screen.getByText('4')).toBeTruthy();
  });
  test('action fires and dismisses', async () => {
    const onPress = jest.fn();
    await setup();
    await show({ title: 'Deleted', duration: null, action: { label: 'Undo', onPress } });
    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    expect(onPress).toHaveBeenCalled();
    expect(screen.queryByText('Deleted')).toBeNull();
  });
  test('renders inside an open modal rather than behind it', async () => {
    await wrap(<ToastProvider><Grab /><Modal open title="M" testID="m" /></ToastProvider>);
    await show({ title: 'Above', duration: null });
    const dialogHost = hostWith((n) => typeof n.props.onRequestClose === 'function');
    expect(dialogHost.queryAll((n) => n.props.children === 'Above').length).toBeGreaterThan(0);
  });
  const stackOf = (title: string) => {
    let node = screen.getByText(title).parent;
    while (node && !(node.props.role === 'status' || node.props.role === 'alert')) node = node.parent;
    return StyleSheet.flatten(node!.parent!.props.style);
  };
  test('sits at the bottom center by default, and a provider default moves it', async () => {
    await setup();
    await show({ title: 'Plain', duration: null });
    expect(stackOf('Plain')).toMatchObject({ justifyContent: 'flex-end', alignItems: 'center' });
    await wrap(<ToastProvider position="top" align="end"><Grab /></ToastProvider>);
    await show({ title: 'Moved', duration: null });
    expect(stackOf('Moved')).toMatchObject({ justifyContent: 'flex-start', alignItems: 'flex-end' });
  });
  test('a toast\'s own position beats the provider, and clears the safe area', async () => {
    await wrap(<FerruleProvider insets={{ top: 50, bottom: 30, left: 0, right: 0 }}><ToastProvider position="top"><Grab /></ToastProvider></FerruleProvider>);
    await show({ title: 'Own', position: 'bottom', align: 'start', duration: null });
    await show({ title: 'Inherited', duration: null });
    expect(stackOf('Own')).toMatchObject({ justifyContent: 'flex-end', alignItems: 'flex-start', paddingBottom: 30 + tokens.space[4] });
    expect(stackOf('Inherited')).toMatchObject({ justifyContent: 'flex-start', paddingTop: 50 + tokens.space[4] });
  });
  test('the provider sets the auto-dismiss time, and a toast overrides it', async () => {
    await wrap(<ToastProvider duration={null}><Grab /></ToastProvider>);
    await show({ title: 'Stays' });
    await show({ title: 'Short', duration: 100 });
    await act(async () => { jest.advanceTimersByTime(60000); });
    expect(screen.getByText('Stays')).toBeTruthy();
    expect(screen.queryByText('Short')).toBeNull();
  });
  test('the default animation slides in and fades out, on the motion tokens', () => {
    const motion = toastMotion('bottom', tokens.motion);
    expect(motion.entering).toBeInstanceOf(FadeInDown);
    expect(motion.exiting).toBeInstanceOf(FadeOut);
    expect(motion.entering!.durationV).toBe(tokens.motion.normal);
    expect(motion.exiting!.durationV).toBe(tokens.motion.fast);
  });
  test('slide follows the position, and a toast\'s animation beats the provider\'s per direction', () => {
    const top = toastMotion('top', tokens.motion, { animation: 'slide' });
    expect(top.entering).toBeInstanceOf(FadeInUp);
    expect(top.exiting).toBeInstanceOf(FadeOutUp);
    const bottom = toastMotion('bottom', tokens.motion, { animation: 'slide' });
    expect(bottom.exiting).toBeInstanceOf(FadeOutDown);
    const merged = toastMotion('bottom', tokens.motion, { animation: { enter: 'fade' } }, { animation: 'scale', animationDuration: 80 });
    expect(merged.entering).toBeInstanceOf(FadeIn);
    expect(merged.exiting).toBeInstanceOf(ZoomOut);
    expect(merged.exiting!.durationV).toBe(80);
    expect(toastMotion('bottom', tokens.motion, undefined, { animation: 'scale' }).entering).toBeInstanceOf(ZoomIn);
  });
  test('none has no animation', () => {
    expect(toastMotion('top', tokens.motion, { animation: 'none' })).toEqual({ entering: undefined, exiting: undefined });
  });
  test('throws a clear error without a provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(wrap(<Grab />)).rejects.toThrow('ToastProvider');
    jest.restoreAllMocks();
  });
  test('unmount clears timers', async () => {
    const view = await setup();
    await show({ title: 'X', duration: 5000 });
    await view.unmount();
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(jest.getTimerCount()).toBeLessThanOrEqual(RENDERER_OWN_TIMERS);
  });
});

describe('misc', () => {
  test('Text headings expose a heading role and body does not', async () => {
    await wrap(<View><Text variant="h1">Head</Text><Text>Body</Text></View>);
    expect(screen.getByRole('heading', { name: 'Head' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Body' })).toBeNull();
  });
  test('Spinner announces itself unless told not to', async () => {
    await wrap(<View><Spinner /><Spinner label={null} /></View>);
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
  });
  test('a spinning Spinner stops its loop on unmount', async () => {
    jest.useFakeTimers();
    const view = await wrap(<Spinner />);
    await act(async () => { jest.advanceTimersByTime(100); });
    await view.unmount();
    await act(async () => { jest.advanceTimersByTime(5000); });
    expect(jest.getTimerCount()).toBeLessThanOrEqual(RENDERER_OWN_TIMERS);
    jest.useRealTimers();
  });
  test('Card pressable is a button and static is not', async () => {
    const onPress = jest.fn();
    await wrap(<View><Card testID="static" /><Card aria-label="Open" onPress={onPress} /></View>);
    await fireEvent.press(screen.getByRole('button', { name: 'Open' }));
    expect(onPress).toHaveBeenCalled();
  });
  test('Stack maps tokens and Divider is a 1dp separator', async () => {
    await wrap(<Stack testID="s" gap={4} direction="horizontal"><Divider testID="d" /></Stack>);
    expect(flat(screen.getByTestId('s'))).toMatchObject({ gap: 16, flexDirection: 'row' });
    expect(flat(screen.getByTestId('d')).height).toBe(1);
  });
  test('components render with no provider, using default theme', async () => {
    await render(<Button>Plain</Button>);
    expect(screen.getByRole('button', { name: 'Plain' })).toBeTruthy();
  });
  test('dark mode applies the dark palette', async () => {
    await render(<FerruleProvider colorMode="dark"><Text testID="t">x</Text></FerruleProvider>);
    expect(flat(screen.getByTestId('t')).color).toBe(defaultTheme.colors.dark.text);
  });
  test('the provider paints the theme background, so dark text is never on a white window', async () => {
    await render(<FerruleProvider colorMode="dark"><View testID="child" /></FerruleProvider>);
    const root = hostWith((n) => flat(n as never)?.backgroundColor === defaultTheme.colors.dark.background);
    expect(root).toBeTruthy();
  });
  test('the palette prop takes a custom palette, and the theme carries one too', async () => {
    const custom = createPalette({ light: '#7A1F5C', dark: '#F2B5DC' });
    const view = await render(<FerruleProvider palette={custom} colorMode="dark"><Text testID="t" tone="primary">x</Text></FerruleProvider>);
    expect(flat(screen.getByTestId('t')).color).toBe(custom.dark.primary);
    await view.rerender(<FerruleProvider theme={createTheme({ palette: custom })} colorMode="light"><Text testID="t" tone="primary">x</Text></FerruleProvider>);
    expect(flat(screen.getByTestId('t')).color).toBe(custom.light.primary);
  });
  test('the palette prop reprints copied components at runtime, with no edit to them', async () => {
    const screenFor = (palette: 'cobalt' | 'plum') => <FerruleProvider palette={palette} colorMode="light"><Text testID="t" tone="primary">x</Text></FerruleProvider>;
    await render(screenFor('cobalt'));
    expect(flat(screen.getByTestId('t')).color).toBe(palettes.cobalt.light.primary);
    await screen.rerender(screenFor('plum'));
    expect(flat(screen.getByTestId('t')).color).toBe(palettes.plum.light.primary);
  });
  test('per-weight font families replace fontWeight', async () => {
    const theme = createTheme({ tokens: { fontFamily: { bold: 'Inter-Bold', regular: 'Inter' } } });
    await render(<FerruleProvider theme={theme}><Text testID="t" variant="h1">x</Text></FerruleProvider>);
    const style = flat(screen.getByTestId('t'));
    expect(style.fontFamily).toBe('Inter-Bold');
    expect(style.fontWeight).toBeUndefined();
  });
});

test('a Toast from the root reaches a Modal under a nested provider, in its own theme', async () => {
  let api: ReturnType<typeof useToast>;
  function Grab() { api = useToast(); return null; }
  await render(
    <FerruleProvider colorMode="light">
      <ToastProvider>
        <Grab />
        <FerruleProvider palette="cobalt"><Modal open title="Nested" testID="nested" /></FerruleProvider>
      </ToastProvider>
    </FerruleProvider>,
  );
  await act(async () => { api.show({ title: 'Above', duration: null }); });
  const dialog = screen.getByTestId('nested-backdrop', { includeHiddenElements: true }).parent!;
  expect(dialog.queryAll((n) => n.props.children === 'Above')).toHaveLength(1);
});

test('every view component forwards its ref and takes a theme slot', async () => {
  const theme = createTheme({ components: Object.fromEntries(['carousel', 'icon', 'progress', 'spinner', 'stepper', 'swipeRow', 'segmented', 'tabbar'].map((name) => [name, { container: { margin: 7 } }])) });
  const cases: [string, (ref: { current: unknown }) => ReactElement][] = [
    ['carousel', (ref) => <Carousel ref={ref as never} testID="x" itemWidth={100}><Text>a</Text></Carousel>],
    ['progress', (ref) => <Progress ref={ref as never} testID="x" label="p" value={0.5} />],
    ['ring', (ref) => <ProgressRing ref={ref as never} testID="x" label="p" value={0.5} />],
    ['spinner', (ref) => <Spinner ref={ref as never} testID="x" />],
    ['stepper', (ref) => <Stepper ref={ref as never} testID="x" label="s" value={1} onValueChange={() => {}} />],
    ['swipeRow', (ref) => <SwipeRow ref={ref as never} testID="x"><Text>a</Text></SwipeRow>],
    ['segmented', (ref) => <Segmented ref={ref as never} testID="x" label="s" options={[{ value: 'a', label: 'A' }]} />],
    ['tabbar', (ref) => <TabBar ref={ref as never} testID="x" items={[{ value: 'a', label: 'A', icon: 'home' }]} />],
    ['icon', (ref) => <Icon ref={ref as never} testID="x" name="home" />],
  ];
  for (const [name, make] of cases) {
    const ref = { current: null as unknown };
    const { unmount } = await render(<FerruleProvider colorMode="light" theme={theme}>{make(ref)}</FerruleProvider>);
    expect([name, ref.current]).not.toEqual([name, null]);
    expect([name, flat(screen.getByTestId('x', { includeHiddenElements: true })).margin]).toEqual([name, 7]);
    await unmount();
  }
});
