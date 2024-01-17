"use client"

import dynamic from 'next/dynamic';

const RuanganPageNoSSR = dynamic(() => import('@/components/ruanganPage'), {
  ssr: false,
});

const RuanganPageWrapper = ({ slug }) => {
  return <RuanganPageNoSSR slug={slug} />;
};

export default RuanganPageWrapper;