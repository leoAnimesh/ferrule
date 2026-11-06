#import <React/RCTViewComponentView.h>
#import <react/renderer/components/FerruleNativeSpec/ComponentDescriptors.h>
#import <react/renderer/components/FerruleNativeSpec/Props.h>
#import "FerruleNative-Swift.h"

using namespace facebook::react;

// Real UIGlassEffect holding React children. Not hosted through SwiftUI, because Fabric must mount the children here.
// JS only renders this from iOS 26.
@interface FerruleGlassViewComponentView : RCTViewComponentView
@end

@implementation FerruleGlassViewComponentView {
  UIVisualEffectView *_effectView;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<FerruleGlassViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _props = std::make_shared<const FerruleGlassViewProps>();
    _effectView = [UIVisualEffectView new];
    _effectView.frame = self.bounds;
    _effectView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self addSubview:_effectView];
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &next = *std::static_pointer_cast<const FerruleGlassViewProps>(props);
  NSData *data = [[NSString stringWithUTF8String:next.config.c_str()] dataUsingEncoding:NSUTF8StringEncoding];
  NSDictionary *config = data ? [NSJSONSerialization JSONObjectWithData:data options:0 error:nil] : nil;
  // Follow the theme, not the OS: glass adapts to its trait, and text on it is drawn in the theme's colors.
  _effectView.overrideUserInterfaceStyle = [config[@"dark"] boolValue] ? UIUserInterfaceStyleDark : UIUserInterfaceStyleLight;
  if (@available(iOS 26.0, *)) {
    UIGlassEffect *effect = [UIGlassEffect effectWithStyle:UIGlassEffectStyleRegular];
    effect.interactive = [config[@"interactive"] boolValue];
    if ([config[@"tint"] isKindOfClass:NSString.class]) {
      effect.tintColor = [FerruleColorBridge parse:config[@"tint"]];
    }
    _effectView.effect = effect;
    CGFloat radius = [config[@"radius"] doubleValue];
    _effectView.cornerConfiguration = [UICornerConfiguration configurationWithRadius:[UICornerRadius fixedRadius:radius]];
  }
  [super updateProps:props oldProps:oldProps];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_effectView.contentView insertSubview:childComponentView atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
}

@end
