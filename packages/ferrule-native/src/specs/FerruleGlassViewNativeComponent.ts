import { codegenNativeComponent, type ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  config: string;
}

export default codegenNativeComponent<NativeProps>('FerruleGlassView', { excludedPlatforms: ['android'] });
