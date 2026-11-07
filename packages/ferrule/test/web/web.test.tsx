import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState, type ReactElement } from 'react';
import { FerruleProvider, FlatList } from 'ferrule';
import { Button, IconButton } from '../../registry/components/button';
import { List, ListItem } from '../../registry/components/list';
import { Stepper } from '../../registry/components/stepper';
import { Chip } from '../../registry/components/chip';
import { Progress } from '../../registry/components/progress';
import { Segmented } from '../../registry/components/segmented';
import { TabBar } from '../../registry/components/tabbar';
import { Checkbox } from '../../registry/components/checkbox';
import { Input } from '../../registry/components/input';
import { Modal } from '../../registry/components/modal';
import { Switch } from '../../registry/components/switch';
import { Image } from '../../registry/components/image';
import { Text } from '../../registry/components/text';
import { ToastProvider, useToast } from '../../registry/components/toast';

const wrap = (ui: ReactElement, direction: 'ltr' | 'rtl' = 'ltr') =>
  render(<FerruleProvider colorMode="light" direction={direction}>{ui}</FerruleProvider>);

test('Button is a focusable role=button with disabled and busy attributes', () => {
  wrap(<><Button>Go</Button><Button disabled>Off</Button><Button loading>Busy</Button></>);
  expect(screen.getByRole('button', { name: 'Go' }).getAttribute('tabindex')).toBe('0');
  const off = screen.getByRole('button', { name: 'Off' });
  expect(off.getAttribute('aria-disabled')).toBe('true');
  expect((off as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Busy' }).getAttribute('aria-busy')).toBe('true');
});

test('a button is a real <button>, so the browser gives it Enter and Space, and click presses it', () => {
  const onPress = jest.fn();
  wrap(<Button onPress={onPress}>Go</Button>);
  const button = screen.getByRole('button', { name: 'Go' });
  expect(button.tagName).toBe('BUTTON');
  fireEvent.click(button);
  expect(onPress).toHaveBeenCalled();
});

test('Space toggles a checkbox and a switch, and prevents page scroll', () => {
  const onBox = jest.fn();
  const onSwitch = jest.fn();
  wrap(<><Checkbox label="Box" onCheckedChange={onBox} /><Switch label="Sw" onCheckedChange={onSwitch} /></>);
  const box = screen.getByRole('checkbox', { name: 'Box' });
  const toggle = screen.getByRole('switch', { name: 'Sw' });
  expect(fireEvent.keyDown(box, { key: ' ' })).toBe(false);
  fireEvent.keyDown(toggle, { key: ' ' });
  expect(onBox).toHaveBeenCalledWith(true);
  expect(onSwitch).toHaveBeenCalledWith(true);
  expect(box.getAttribute('aria-checked')).toBe('true');
  expect(toggle.getAttribute('aria-checked')).toBe('true');
});

test('Space does nothing on a disabled checkbox', () => {
  const onBox = jest.fn();
  wrap(<Checkbox label="Box" disabled onCheckedChange={onBox} />);
  fireEvent.keyDown(screen.getByRole('checkbox', { name: 'Box' }), { key: ' ' });
  expect(onBox).not.toHaveBeenCalled();
});

test('indeterminate reports aria-checked=mixed', () => {
  wrap(<Checkbox label="All" indeterminate />);
  expect(screen.getByRole('checkbox', { name: 'All' }).getAttribute('aria-checked')).toBe('mixed');
});

test('Input labels the field, wires aria-invalid, and links the message by id', () => {
  wrap(<Input label="Email" error="Required" required />);
  const field = screen.getByLabelText('Email');
  expect(field.getAttribute('aria-invalid')).toBe('true');
  expect(field.getAttribute('aria-required')).toBe('true');
  const message = screen.getByRole('alert');
  expect(message.textContent).toBe('Required');
  expect(field.getAttribute('aria-describedby')).toBe(message.id);
});

test('uncontrolled Input keeps typed text; controlled follows its prop', () => {
  function Both() {
    const [value, setValue] = useState('a');
    return <><Input label="U" defaultValue="x" /><Input label="C" value={value} onChangeText={(t) => setValue(t.toUpperCase())} /></>;
  }
  wrap(<Both />);
  fireEvent.change(screen.getByLabelText('U'), { target: { value: 'xy' } });
  expect((screen.getByLabelText('U') as HTMLInputElement).value).toBe('xy');
  fireEvent.change(screen.getByLabelText('C'), { target: { value: 'ab' } });
  expect((screen.getByLabelText('C') as HTMLInputElement).value).toBe('AB');
});

test('headings use a heading role with the right level', () => {
  wrap(<Text variant="h2">Hi</Text>);
  expect(screen.getByRole('heading', { level: 2, name: 'Hi' })).toBeTruthy();
});

test('Image alt becomes the accessible name, and decorative images are hidden', () => {
  wrap(<><Image alt="A cat" source={null} aspectRatio={1} /><Image testID="deco" alt="" source={null} aspectRatio={1} /></>);
  expect(screen.getByRole('img', { name: 'A cat' })).toBeTruthy();
  expect(screen.getAllByRole('img')).toHaveLength(1);
});

test('rtl sets dir on the root, and on text so Latin strings still align to the layout', () => {
  const { container } = wrap(<Text>Latin</Text>, 'rtl');
  expect(container.querySelector('[dir="rtl"]')).toBeTruthy();
  expect(screen.getByText('Latin').getAttribute('dir')).toBe('rtl');
});

describe('Modal', () => {
  function Harness({ dismissible }: { dismissible?: boolean }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onPress={() => setOpen(true)}>Open</Button>
        <Modal open={open} onOpenChange={setOpen} title="Dialog" dismissible={dismissible} footer={<Button>Confirm</Button>} />
      </>
    );
  }
  const open = async () => {
    const trigger = screen.getByRole('button', { name: 'Open' });
    trigger.focus();
    fireEvent.click(trigger);
    return { trigger, dialog: await screen.findByRole('dialog', { name: 'Dialog' }) };
  };

  test('exposes aria-modal, moves focus inside, and Escape closes it', async () => {
    wrap(<Harness />);
    const { dialog } = await open();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    fireEvent.keyUp(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 2000 });
  });

  test('restores focus to the trigger after closing', async () => {
    wrap(<Harness />);
    const { trigger } = await open();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 2000 });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  test('Escape does not close a non-dismissible modal', async () => {
    wrap(<Harness dismissible={false} />);
    const { dialog } = await open();
    fireEvent.keyUp(document.activeElement ?? dialog, { key: 'Escape' });
    await act(async () => { await new Promise((r) => setTimeout(r, 400)); });
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();
  });
});

test('a modal opened right after mount, and reopened during its exit, stays open', async () => {
  function Quick() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onPress={() => setOpen((v) => !v)}>Toggle</Button>
        <Modal open={open} onOpenChange={setOpen} title="Quick" />
      </>
    );
  }
  wrap(<Quick />);
  const toggle = screen.getByRole('button', { name: 'Toggle' });
  fireEvent.click(toggle);
  await screen.findByRole('dialog', { name: 'Quick' });
  fireEvent.click(toggle);
  fireEvent.click(toggle);
  await act(async () => { await new Promise((r) => setTimeout(r, 500)); });
  expect(screen.getByRole('dialog', { name: 'Quick' })).toBeTruthy();
});

test('backdrop click closes a modal, and is not a focus target', async () => {
  function Open() {
    const [open, setOpen] = useState(true);
    return <Modal open={open} onOpenChange={setOpen} title="D" testID="m" />;
  }
  wrap(<Open />);
  const backdrop = await screen.findByTestId('m-backdrop');
  expect(backdrop.getAttribute('tabindex')).toBeNull();
  fireEvent.click(backdrop);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 2000 });
});

test('a toast is anchored to the window, so it shows when the document itself scrolls', async () => {
  let api: ReturnType<typeof useToast>;
  function Grab() { api = useToast(); return null; }
  wrap(<ToastProvider><Grab /></ToastProvider>);
  await act(async () => { api.show({ title: 'Saved', duration: null }); });
  const toast = screen.getByRole('status', { hidden: true });
  const positions: string[] = [];
  for (let node = toast.parentElement; node; node = node.parentElement) positions.push(getComputedStyle(node).position);
  expect(positions).toContain('fixed');
});

test('the toast layer does not block clicks on the page under it', async () => {
  function Empty() { return null; }
  const { container } = wrap(<ToastProvider><Empty /></ToastProvider>);
  await act(async () => {});
  const layer = Array.from(container.querySelectorAll('div')).find((node) => getComputedStyle(node).position === 'fixed')!;
  for (const node of [layer, ...Array.from(layer.children)]) expect(getComputedStyle(node).pointerEvents).toBe('none');
});

test('toast timer pauses while hovered', async () => {
  jest.useFakeTimers();
  let api: ReturnType<typeof useToast>;
  function Grab() { api = useToast(); return null; }
  wrap(<ToastProvider><Grab /></ToastProvider>);
  await act(async () => { api.show({ title: 'Hello', duration: 1000, testID: 'toast' }); });
  const toast = screen.getByTestId('toast');
  fireEvent.mouseEnter(toast);
  await act(async () => { jest.advanceTimersByTime(5000); });
  expect(screen.queryByTestId('toast')).toBeTruthy();
  fireEvent.mouseLeave(toast);
  await act(async () => { jest.advanceTimersByTime(1100); });
  expect(screen.queryByTestId('toast')).toBeNull();
  jest.useRealTimers();
});

test('FlatList on web virtualises', () => {
  const data = Array.from({ length: 1000 }, (_, i) => ({ id: String(i), label: `Row ${i}` }));
  wrap(<FlatList data={data} initialNumToRender={5} renderItem={({ item }) => <Text>{item.label}</Text>} />);
  expect(screen.getByText('Row 0')).toBeTruthy();
  expect(screen.queryByText('Row 999')).toBeNull();
});

test('the screen building blocks have real roles on the web', () => {
  wrap(
    <>
      <IconButton aria-label="Back">x</IconButton>
      <Chip label="Veg" selected={false} />
      <Segmented label="Show" options={[{ value: 'a', label: 'All' }, { value: 'b', label: 'Done' }]} />
      <TabBar items={[{ value: 'h', label: 'Home', icon: { uri: 'h.png' } }]} />
      <Progress label="Finished" value={0.5} />
    </>,
  );
  expect(screen.getByRole('button', { name: 'Back' }).getAttribute('tabindex')).toBe('0');
  expect(screen.getByRole('checkbox', { name: 'Veg' }).getAttribute('aria-checked')).toBe('false');
  expect(screen.getByRole('radio', { name: 'All' }).getAttribute('aria-checked')).toBe('true');
  expect(screen.getByRole('tab', { name: 'Home' }).getAttribute('aria-selected')).toBe('true');
  expect(screen.getByRole('progressbar', { name: 'Finished' }).getAttribute('aria-valuenow')).toBe('50');
});

test('A directional Feather icon mirrors in right-to-left, and a media control does not', () => {
  const { Icon } = require('../../registry/components/icon');
  render(<FerruleProvider colorMode="light" direction="rtl"><Icon name="chevron-left" label="Back" /><Icon name="skip-forward" label="Next" /></FerruleProvider>);
  expect(window.getComputedStyle(screen.getByLabelText('Back')).transform).toContain('scaleX(-1)');
  expect(window.getComputedStyle(screen.getByLabelText('Next')).transform).not.toContain('scaleX(-1)');
});

test('live regions exist before a toast, so browsers announce it, and danger is assertive', async () => {
  let api: ReturnType<typeof useToast>;
  function Grab() { api = useToast(); return null; }
  wrap(<ToastProvider><Grab /></ToastProvider>);
  await act(async () => {});
  const polite = screen.getByRole('status', { hidden: true });
  const assertive = screen.getByRole('alert', { hidden: true });
  expect(polite.getAttribute('aria-live')).toBe('polite');
  expect(assertive.getAttribute('aria-live')).toBe('assertive');
  expect(polite.textContent).toBe('');
  await act(async () => { api.show({ title: 'Saved', description: 'All good', duration: null }); api.show({ title: 'Failed', tone: 'danger', duration: null }); });
  expect(screen.getByRole('status', { hidden: true })).toBe(polite);
  expect(polite.textContent).toBe('Saved. All good');
  expect(assertive.textContent).toBe('Failed');
});

test('Stepper is a group holding a spin button: arrows step, Home and End jump, and it stops at its limits', () => {
  function Demo() {
    const [value, setValue] = useState(5);
    return <Stepper label="Focus" value={value} onValueChange={setValue} min={0} max={10} step={5} unit="min" />;
  }
  wrap(<Demo />);
  expect(screen.queryByRole('slider')).toBeNull();
  const group = screen.getByRole('group', { name: 'Focus' });
  expect(group.getAttribute('aria-valuenow')).toBeNull();
  const spin = within(group).getByRole('spinbutton', { name: 'Focus' });
  expect(spin.getAttribute('tabindex')).toBe('0');
  expect(spin.getAttribute('aria-valuetext')).toBe('5 min');
  fireEvent.keyDown(spin, { key: 'ArrowUp' });
  expect(spin.getAttribute('aria-valuenow')).toBe('10');
  fireEvent.keyDown(spin, { key: 'ArrowUp' });
  expect(spin.getAttribute('aria-valuenow')).toBe('10');
  fireEvent.keyDown(spin, { key: 'Home' });
  expect(spin.getAttribute('aria-valuenow')).toBe('0');
  fireEvent.keyDown(spin, { key: 'End' });
  expect(spin.getAttribute('aria-valuenow')).toBe('10');
  fireEvent.keyDown(spin, { key: 'ArrowDown' });
  expect(spin.getAttribute('aria-valuenow')).toBe('5');
});

test('List rows are list items around their button, and a selected row is aria-current, not aria-selected', () => {
  wrap(<List scrollEnabled={false} data={['a', 'b']} keyExtractor={(item) => item} renderItem={({ item }) => <ListItem title={item} description="More" end={<Text>Delivered</Text>} selected={item === 'a'} onPress={() => {}} />} />);
  const list = screen.getByRole('list');
  expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  const row = within(within(list).getAllByRole('listitem')[0]!).getByRole('button');
  expect(row.getAttribute('aria-selected')).toBeNull();
  expect(row.getAttribute('aria-current')).toBe('true');
  // Named by its own text, so what shows and what is read can't disagree.
  expect(row.getAttribute('aria-label')).toBeNull();
});

test('List has no list role around a spinner or empty text, and a loose ListItem claims no list item role', () => {
  wrap(<><List data={[]} renderItem={() => null} emptyText="None" /><List loading data={['a']} renderItem={() => null} /><ListItem title="Alone" /></>);
  expect(screen.queryByRole('list')).toBeNull();
  expect(screen.queryByRole('listitem')).toBeNull();
});

test('Segmented is one tab stop, arrows move and select, wrap, and swap in right-to-left', () => {
  const options = [{ value: 'a', label: 'One' }, { value: 'b', label: 'Two' }, { value: 'c', label: 'Three' }];
  wrap(<Segmented label="Pick" options={options} defaultValue="a" />);
  const radio = (name: string) => screen.getByRole('radio', { name });
  expect([radio('One'), radio('Two')].map((node) => node.getAttribute('tabindex'))).toEqual(['0', '-1']);
  fireEvent.keyDown(radio('One'), { key: 'ArrowRight' });
  expect(radio('Two').getAttribute('aria-checked')).toBe('true');
  expect(document.activeElement).toBe(radio('Two'));
  expect(radio('Two').getAttribute('tabindex')).toBe('0');
  fireEvent.keyDown(radio('Two'), { key: 'ArrowDown' });
  expect(radio('Three').getAttribute('aria-checked')).toBe('true');
  fireEvent.keyDown(radio('Three'), { key: 'ArrowRight' });
  expect(radio('One').getAttribute('aria-checked')).toBe('true');
  fireEvent.keyDown(radio('One'), { key: 'End' });
  expect(radio('Three').getAttribute('aria-checked')).toBe('true');
});

test('In right-to-left the left arrow moves forward', () => {
  wrap(<Segmented label="Pick" options={[{ value: 'a', label: 'One' }, { value: 'b', label: 'Two' }, { value: 'c', label: 'Three' }]} defaultValue="a" />, 'rtl');
  fireEvent.keyDown(screen.getByRole('radio', { name: 'One' }), { key: 'ArrowLeft' });
  expect(screen.getByRole('radio', { name: 'Two' }).getAttribute('aria-checked')).toBe('true');
});

test('A disabled Segmented ignores arrows', () => {
  const change = jest.fn();
  wrap(<Segmented label="Pick" disabled onValueChange={change} options={[{ value: 'a', label: 'One' }, { value: 'b', label: 'Two' }]} defaultValue="a" />);
  fireEvent.keyDown(screen.getByRole('radio', { name: 'One' }), { key: 'ArrowRight' });
  expect(change).not.toHaveBeenCalled();
});

test('TabBar arrows move and select left and right, and leave up and down to the page', () => {
  wrap(<TabBar items={[{ value: 'h', label: 'Home', icon: 'home' }, { value: 'o', label: 'Orders', icon: 'package' }]} defaultValue="h" />);
  const tab = (name: string) => screen.getByRole('tab', { name });
  expect(tab('Orders').getAttribute('tabindex')).toBe('-1');
  fireEvent.keyDown(tab('Home'), { key: 'ArrowDown' });
  expect(tab('Home').getAttribute('aria-selected')).toBe('true');
  fireEvent.keyDown(tab('Home'), { key: 'ArrowRight' });
  expect(tab('Orders').getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(tab('Orders'));
});

test('An open Modal locks the page behind it until the last overlay closes', async () => {
  const root = document.documentElement;
  const { rerender } = render(<FerruleProvider colorMode="light"><Modal open title="One" /><Modal open title="Two" /></FerruleProvider>);
  await act(async () => {});
  expect(root.style.overflow).toBe('hidden');
  rerender(<FerruleProvider colorMode="light"><Modal open title="One" /><Modal open={false} title="Two" /></FerruleProvider>);
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Two' })).toBeNull());
  expect(root.style.overflow).toBe('hidden');
  rerender(<FerruleProvider colorMode="light"><Modal open={false} title="One" /><Modal open={false} title="Two" /></FerruleProvider>);
  await waitFor(() => expect(root.style.overflow).toBe(''));
});
