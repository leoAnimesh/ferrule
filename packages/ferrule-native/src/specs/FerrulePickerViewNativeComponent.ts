import { codegenNativeComponent, type CodegenTypes, type ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  config: string;
  onFerruleEvent?: CodegenTypes.DirectEventHandler<{ name: string; value: string }>;
  onFerruleSize?: CodegenTypes.DirectEventHandler<{ width: CodegenTypes.Double; height: CodegenTypes.Double }>;
}

export default codegenNativeComponent<NativeProps>('FerrulePickerView');
