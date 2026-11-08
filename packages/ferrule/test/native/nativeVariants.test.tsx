import { createElement } from 'react';
import { act, render as rntlRender } from '@testing-library/react-native';
import { FlatList as RNFlatList, Platform, Text as RNText, UIManager } from 'react-native';
import { FerruleProvider, FlatList, registerNativeVariants, resetNativeVariants, resolveNativeVariant, useNativeVariant } from '@leoanimesh/ferrule';
import { Button } from '../../registry/components/button';
import { Switch } from '../../registry/components/switch';
import { NativeButton, NativeGlass } from '../../../ferrule-native/src/components';
import { pickHost } from '../../../ferrule-native/src/host';

const Marker = (props: object) => createElement('Marker', props);
const available = { Component: Marker as never, isAvailable: () => true };
const render = async (element: React.ReactElement) => rntlRender(element);
type Tree = Awaited<ReturnType<typeof render>>;
const all = (tree: Tree, type: string) => tree.container.queryAll((node: { type: unknown }) => String(node.type) === type);
const json = (tree: Tree) => JSON.stringify(tree.toJSON());

beforeEach(() => resetNativeVariants());

describe('native variant selection', () => {
  it('needs both a request and a registered, available variant', () => {
    expect(resolveNativeVariant('button', undefined)).toBeNull();
    expect(resolveNativeVariant('button', false)).toBeNull();
    registerNativeVariants({ button: available });
    expect(resolveNativeVariant('button', true)).toBe(Marker);
    registerNativeVariants({ button: { ...available, isAvailable: () => false } });
    expect(resolveNativeVariant('button', true)).toBeNull();
  });

  it('warns once in dev when the package is missing', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    resolveNativeVariant('switch', true);
    resolveNativeVariant('switch', true);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('@leoanimesh/ferrule-native');
    warn.mockRestore();
  });

  it('a component without the package renders itself, and does not crash', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const tree = await render(<FerruleProvider><Button native>Save</Button></FerruleProvider>);
    expect(all(tree, 'Marker')).toHaveLength(0);
    expect(json(tree)).toContain('Save');
    warn.mockRestore();
  });

  it('existing behaviour stays the default even with the package registered', async () => {
    registerNativeVariants({ button: available });
    const tree = await render(<FerruleProvider><Button>Save</Button></FerruleProvider>);
    expect(all(tree, 'Marker')).toHaveLength(0);
  });

  it('prop wins over provider, and provider sets the default', async () => {
    registerNativeVariants({ button: available });
    const on = await render(<FerruleProvider native><Button>Save</Button></FerruleProvider>);
    expect(all(on, 'Marker')).toHaveLength(1);
    const off = await render(<FerruleProvider native><Button native={false}>Save</Button></FerruleProvider>);
    expect(all(off, 'Marker')).toHaveLength(0);
    const nested = await render(<FerruleProvider native><FerruleProvider native={false}><Button>Save</Button></FerruleProvider></FerruleProvider>);
    expect(all(nested, 'Marker')).toHaveLength(0);
  });

  it('button maps its props, and falls back for what a system button cannot show', async () => {
    registerNativeVariants({ button: available });
    const onPress = jest.fn();
    const tree = await render(<FerruleProvider><Button native variant="soft" onPress={onPress}>Save</Button></FerruleProvider>);
    expect(all(tree, 'Marker')[0]?.props).toMatchObject({ label: 'Save', variant: 'soft', onPress });
    const nonString = await render(<FerruleProvider><Button native><RNText>Save</RNText></Button></FerruleProvider>);
    expect(all(nonString, 'Marker')).toHaveLength(0);
    const withIcon = await render(<FerruleProvider><Button native start={<RNText>i</RNText>}>Save</Button></FerruleProvider>);
    expect(all(withIcon, 'Marker')).toHaveLength(0);
  });

  it('switch maps controlled props', async () => {
    registerNativeVariants({ switch: available });
    const onCheckedChange = jest.fn();
    const tree = await render(<FerruleProvider><Switch native label="Wi-Fi" checked onCheckedChange={onCheckedChange} /></FerruleProvider>);
    expect(all(tree, 'Marker')[0]?.props).toMatchObject({ label: 'Wi-Fi', checked: true, onCheckedChange });
  });

  it('useNativeVariant is usable directly', async () => {
    registerNativeVariants({ custom: available });
    let got: unknown;
    const Probe = () => { got = useNativeVariant('custom', true); return null; };
    await render(<FerruleProvider><Probe /></FerruleProvider>);
    expect(got).toBe(Marker);
  });
});

describe('host availability', () => {
  const version = Object.getOwnPropertyDescriptor(Platform, 'Version');
  const setIos = (value: string) => Object.defineProperty(Platform, 'Version', { get: () => value, configurable: true });
  afterEach(() => { if (version) Object.defineProperty(Platform, 'Version', version); });

  it('is false for an unlinked view, the wrong platform, and iOS below 17', () => {
    const has = jest.spyOn(UIManager, 'hasViewManagerConfig');
    setIos('26.5');
    has.mockReturnValue(true);
    expect(pickHost({}, 'ViewA')).toBe(true);
    expect(pickHost({}, 'ViewA', ['android'])).toBe(false);
    expect(pickHost(undefined, 'ViewA')).toBe(false);
    has.mockReturnValue(false);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(pickHost({}, 'ViewB')).toBe(false);
    expect(warn.mock.calls[0]?.[0]).toContain('Expo Go');
    warn.mockRestore();
    has.mockReturnValue(true);
    setIos('16.4');
    expect(pickHost({}, 'ViewC')).toBe(false);
    has.mockRestore();
  });

  it('a host renders its fallback when unlinked', async () => {
    const has = jest.spyOn(UIManager, 'hasViewManagerConfig').mockReturnValue(false);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const tree = await render(<FerruleProvider><NativeButton label="x" fallback={<RNText>plain</RNText>} /></FerruleProvider>);
    expect(json(tree)).toContain('plain');
    has.mockRestore();
    warn.mockRestore();
  });

  it('glass falls back to a themed surface below iOS 26', async () => {
    setIos('18.0');
    const tree = await render(<FerruleProvider><NativeGlass><RNText>inside</RNText></NativeGlass></FerruleProvider>);
    expect(json(tree)).toContain('inside');
    expect(all(tree, 'FerruleGlassView')).toHaveLength(0);
  });
});

test('FlatList from ferrule is React Native\'s', () => {
  expect(FlatList).toBe(RNFlatList);
});
