#import <React/RCTViewComponentView.h>

@class FerruleHostingView;

/// Base of every hosted view. FERRULE_HOST_VIEW in FerruleViews.mm makes the per-component subclass.
@interface FerruleHostComponentView : RCTViewComponentView
@property (nonatomic, strong) FerruleHostingView *hostingView;
- (void)configureHostNamed:(NSString *)name;
@end
