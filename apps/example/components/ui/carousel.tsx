import { useRef, type ComponentRef, type ReactNode } from 'react';
import { I18nManager, Platform, ScrollView, useTheme, type SpaceToken, type StyleProp, type ViewStyle } from 'ferrule';

export interface CarouselProps {
  children: ReactNode;
  /** The width of each item. It settles on item edges, and the next item peeks in to show there is more. */
  itemWidth: number;
  gap?: SpaceToken;
  /** Space before the first item and after the last, so they line up with the page's margin. */
  inset?: SpaceToken;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A row of same-width items that scrolls sideways. It never moves by itself, so nothing shifts while someone is reading. */
export function Carousel({ children, itemWidth, gap = 3, inset = 4, style, testID }: CarouselProps) {
  const { tokens } = useTheme();
  // shortcut: on iOS (React Native 0.88) this row opens at its far end in right-to-left, so it scrolls itself back and gives up snapping there, whose steps would not line up. Drop this when that is fixed.
  const flipped = Platform.OS === 'ios' && I18nManager.isRTL;
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const size = useRef({ view: 0, content: 0, done: false });
  const openAtStart = () => {
    const { view, content, done } = size.current;
    if (!flipped || done || !view || !content) return;
    size.current.done = true;
    scroller.current?.scrollTo({ x: Math.max(0, content - view), animated: false });
  };
  return (
    <ScrollView
      horizontal
      ref={scroller}
      onLayout={(event) => { size.current.view = event.nativeEvent.layout.width; openAtStart(); }}
      onContentSizeChange={(width) => { size.current.content = width; openAtStart(); }}
      testID={testID}
      style={style}
      showsHorizontalScrollIndicator={false}
      snapToInterval={!flipped ? itemWidth + tokens.space[gap] : undefined}
      decelerationRate={!flipped ? 'fast' : 'normal'}
      contentContainerStyle={{ paddingHorizontal: tokens.space[inset], gap: tokens.space[gap] }}
    >
      {children}
    </ScrollView>
  );
}
