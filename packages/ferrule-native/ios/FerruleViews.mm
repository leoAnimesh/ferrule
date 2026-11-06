#import "FerruleHostComponentView.h"
#import "FerruleNative-Swift.h"

#import <react/renderer/components/FerruleNativeSpec/ComponentDescriptors.h>
#import <react/renderer/components/FerruleNativeSpec/EventEmitters.h>
#import <react/renderer/components/FerruleNativeSpec/Props.h>

using namespace facebook::react;

// One line per component below: Fabric wiring is the same for every hosted view. See docs/adding-a-component.md.
#define FERRULE_HOST_VIEW(Name)                                                                                     \
  @interface Name##ComponentView : FerruleHostComponentView                                                         \
  @end                                                                                                              \
  @implementation Name##ComponentView                                                                               \
  +(ComponentDescriptorProvider)componentDescriptorProvider                                                         \
  {                                                                                                                 \
    return concreteComponentDescriptorProvider<Name##ComponentDescriptor>();                                        \
  }                                                                                                                 \
  -(instancetype)initWithFrame : (CGRect)frame                                                                      \
  {                                                                                                                 \
    if (self = [super initWithFrame:frame]) {                                                                       \
      _props = std::make_shared<const Name##Props>();                                                               \
      [self configureHostNamed:@ #Name];                                                                            \
      __weak Name##ComponentView *weakSelf = self;                                                                  \
      self.hostingView.onEvent = ^(NSString *name, NSString *value) {                                               \
        Name##ComponentView *strong = weakSelf;                                                                     \
        if (strong && strong->_eventEmitter) {                                                                      \
          Name##EventEmitter::OnFerruleEvent event;                                                                 \
          event.name = name.UTF8String;                                                                             \
          event.value = value.UTF8String;                                                                           \
          std::static_pointer_cast<const Name##EventEmitter>(strong->_eventEmitter)->onFerruleEvent(event);         \
        }                                                                                                           \
      };                                                                                                            \
      self.hostingView.onSize = ^(CGFloat width, CGFloat height) {                                                  \
        Name##ComponentView *strong = weakSelf;                                                                     \
        if (strong && strong->_eventEmitter) {                                                                      \
          Name##EventEmitter::OnFerruleSize event;                                                                  \
          event.width = width;                                                                                      \
          event.height = height;                                                                                    \
          std::static_pointer_cast<const Name##EventEmitter>(strong->_eventEmitter)->onFerruleSize(event);          \
        }                                                                                                           \
      };                                                                                                            \
    }                                                                                                               \
    return self;                                                                                                    \
  }                                                                                                                 \
  -(void)updateProps : (Props::Shared const &)props oldProps : (Props::Shared const &)oldProps                      \
  {                                                                                                                 \
    const auto &next = *std::static_pointer_cast<const Name##Props>(props);                                         \
    [self.hostingView setConfig:[NSString stringWithUTF8String:next.config.c_str()]];                               \
    [super updateProps:props oldProps:oldProps];                                                                    \
  }                                                                                                                 \
  @end

FERRULE_HOST_VIEW(FerruleButtonView)
FERRULE_HOST_VIEW(FerruleToggleView)
FERRULE_HOST_VIEW(FerruleSliderView)
FERRULE_HOST_VIEW(FerruleSegmentedView)
FERRULE_HOST_VIEW(FerrulePickerView)
FERRULE_HOST_VIEW(FerruleMenuView)
FERRULE_HOST_VIEW(FerruleDatePickerView)
FERRULE_HOST_VIEW(FerruleProgressView)
FERRULE_HOST_VIEW(FerruleTextFieldView)
FERRULE_HOST_VIEW(FerruleAlertView)
FERRULE_HOST_VIEW(FerruleActionSheetView)
FERRULE_HOST_VIEW(FerruleTabBarView)
FERRULE_HOST_VIEW(FerruleTopBarView)
FERRULE_HOST_VIEW(FerruleSearchBarView)
FERRULE_HOST_VIEW(FerruleListView)
FERRULE_HOST_VIEW(FerruleChipView)
FERRULE_HOST_VIEW(FerruleFabView)
