import { ComponentProps } from 'react';
import { ViewStyle } from 'react-native';

declare module 'expo-video' {
    type VideoProps = ComponentProps<'View'> & {
        source: any;
        shouldPlay?: boolean;
        isLooping?: boolean;
        resizeMode?: 'cover' | 'contain' | 'stretch';
        onPlaybackStatusUpdate?: (status: any) => void;
        style?: ViewStyle;
    };

    const Video: React.FC<VideoProps>;
    export default Video;
}



