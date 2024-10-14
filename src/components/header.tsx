"use-client";

import React from 'react'
import { WalletSelector } from './walletSelector';

const Header = () => {
  return (
    <div className='dark flex w-[98%] absolute justify-end my-4'>
      <WalletSelector/>
    </div>
  )
}

export default Header
