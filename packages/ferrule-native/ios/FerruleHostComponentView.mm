#import "FerruleHostComponentView.h"
#import "FerruleNative-Swift.h"

@implementation FerruleHostComponentView

+ (BOOL)shouldBeRecycled
{
  // A hosted SwiftUI tree holds state for one control, so it is not reused.
  return NO;
}

- (void)configureHostNamed:(NSString *)name
{
  _hostingView = [[FerruleHostingView alloc] initWithViewName:name];
  _hostingView.frame = self.bounds;
  _hostingView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  self.contentView = _hostingView;
}

@end
