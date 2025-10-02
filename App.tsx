import React from 'react';
import { NativeWindStyleSheet } from 'nativewind';
import AtlasGoApp from './src/components/AtlasGoApp';

// Configuration NativeWind
NativeWindStyleSheet.setOutput({
  default: 'native',
});

export default function App() {
  return <AtlasGoApp />;
}
