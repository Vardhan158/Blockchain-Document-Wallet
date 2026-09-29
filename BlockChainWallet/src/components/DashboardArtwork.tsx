import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';
export type IconName =
  | 'eye'
  | 'home'
  | 'folder'
  | 'plus'
  | 'bell'
  | 'shield'
  | 'document'
  | 'check'
  | 'clock'
  | 'close'
  | 'upload'
  | 'id'
  | 'arrow'
  | 'copy'
  | 'qr'
  | 'chevron';
const paths: Record<IconName, string> = {
  eye: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  home: 'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10',
  folder: 'M3 7V4h6l3 3h8v3M3 10h19l-3 11H2z',
  plus: 'M12 4v16M4 12h16',
  bell: 'M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 21h4M12 2v2',
  shield: 'M12 2c3 3 6 4 9 4v6c0 5-5 9-9 11-4-2-9-6-9-11V6c3 0 6-1 9-4z',
  document: 'M5 2h10l5 5v15H5zM14 2v6h6M8 12h8M8 16h8M8 19h5',
  check: 'm5 12 5 5L20 6',
  clock: 'M12 7v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  close: 'm6 6 12 12M6 18 18 6',
  upload:
    'M7 18H5a4 4 0 0 1-1-8 7 7 0 0 1 14-2 5 5 0 0 1 1 10h-2M12 21V11m-4 4 4-4 4 4',
  id: 'M3 5h18v16H3zM8 3v4M16 3v4M15 10h3M15 14h3M15 18h3M6 18v-2c0-3 5-3 5 0v2zM10 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  copy: 'M8 5H5v17h14V5h-3M8 3h8v4H8z',
  qr: 'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 14v3h3v4M21 14v2M12 3v3M12 11v2M3 12h4M12 18v3M21 20v1',
  chevron: 'm6 9 6 6 6-6',
};
export function VaultIcon({
  name,
  size = 24,
  color = '#171438',
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={paths[name]}
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
export function GradientSurface({
  colors = ['#7545ff', '#3026b5', '#397cff'],
}: {
  colors?: string[];
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="surface" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="0.55" stopColor={colors[1]} />
            <Stop offset="1" stopColor={colors[2]} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#surface)" />
      </Svg>
    </View>
  );
}
export function VaultFolder({
  width = 150,
  height = 115,
  shield = true,
}: {
  width?: number;
  height?: number;
  shield?: boolean;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 180 140">
      <Defs>
        <LinearGradient id="paper" x2="1" y2="1">
          <Stop stopColor="#f5f0ff" />
          <Stop offset="1" stopColor="#b8b1ff" />
        </LinearGradient>
        <LinearGradient id="folder" x2="1" y2="1">
          <Stop stopColor="#a695ff" />
          <Stop offset="1" stopColor="#4935ff" />
        </LinearGradient>
        <LinearGradient id="front" x2="1" y2="1">
          <Stop stopColor="#e9e1ff" />
          <Stop offset="1" stopColor="#9b8bff" />
        </LinearGradient>
      </Defs>
      <Path
        d="M35 24Q35 16 45 18l40 8 10 14 61 14q10 2 7 14l-13 57H25z"
        fill="url(#folder)"
        stroke="#c5beff"
        strokeWidth="2"
      />
      <Path d="m51 9 92 21q8 2 6 11l-16 75-91-17z" fill="url(#paper)" />
      <Path
        d="m91 37 39 9m-43 6 38 9m-42 6 29 7"
        stroke="#d7d1fa"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <Path
        d="M13 45q-2-10 10-8l51 10 10 15 53 10q10 2 7 13l-9 43H27z"
        fill="url(#front)"
        stroke="#eeeaff"
        strokeWidth="2"
      />
      {shield && (
        <>
          <Path
            d="m112 49 25 13 1 27q-2 24-28 36-26-13-27-35V62z"
            fill="#b6abff"
            stroke="#e9e5ff"
            strokeWidth="5"
          />
          <Path
            d="m111 54 20 11v25q-2 18-21 28-20-10-21-29V66z"
            fill="url(#folder)"
            stroke="#7945ff"
            strokeWidth="2"
          />
          <Path
            d="m99 86 9 10 15-18"
            stroke="white"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}
    </Svg>
  );
}
