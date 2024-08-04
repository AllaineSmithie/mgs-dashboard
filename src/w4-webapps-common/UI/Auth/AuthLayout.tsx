/*************************************************************************/
/*  AuthLayout.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { addBasePath } from 'next/dist/client/add-base-path'
import { PropsWithChildren } from 'react'

import Head from 'next/head'
import Image from 'next/image'

export type AuthLayoutProps = {
  appTitle: string;
  headTitle?: string;
  logoHref?: string;
  backgroundImageHref?: string;
  title: string;
} & PropsWithChildren
export function AuthLayout({
  appTitle,
  headTitle = appTitle,
  title,
  logoHref = '/assets/brand/w4games.svg',
  backgroundImageHref = '/assets/img/mgs-background.png',
  children,
} : AuthLayoutProps) {
  const contentBackground = addBasePath(backgroundImageHref)
  const logo = addBasePath(logoHref)

  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta name="description" content="MGS Dashboard" />
        <link rel="icon" href={addBasePath('/favicon.ico')} />
      </Head>
      <div
        className={`
          dark:bg-[linear-gradient(to_right,_rgb(19,16,14)_35%,_rgb(44,43,43)_75%)]
          bg-[radial-gradient(circle_at_center,_rgb(200,194,194)_0%,_rgb(175,163,161)_100%)]
          bg-[position:center]
          bg-[length:100%]
          bg-no-repeat
          h-screen flex items-center justify-center
        `}
      >
        <div className={`
          min-w-full
          md:min-w-[768px] md:max-w-[768px]
          md:min-h-[470px] min-h-full
          md:rounded-md
          overflow-hidden
          grid md:grid-cols-2 grid-cols-1
          `}
        >
          <div
            style={{
              '--content-background': `url(${contentBackground})`,
            } as React.CSSProperties}
            className={`
            bg-[image:var(--content-background)]
            bg-cover
            hidden
            md:flex flex-col
            items-center
            justify-center
            `}
          >
            <div
              className="p-7 flex flex-col items-center"
            >
              <div className="center-container">
                <Image
                  src={logo}
                  width={240}
                  height={50}
                  alt="Metro Gaya Systems logo"
                />
                <h2 className="mt-6 font-bold text-scale-300 text-2xl">
                  {appTitle}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-scale-900">
            <div
              style={{
                '--content-background': `url(${contentBackground})`,
              } as React.CSSProperties}
              className={`
              p-10
              bg-[image:var(--content-background)]
              bg-cover
              flex flex-col
              items-center
              justify-center
              flex-1
              md:hidden
              visible
              `}
            >
              <Image
                src={logo}
                width={200}
                height={50}
                alt="Metro Gaya Systems logo"
              />
            </div>
            <div className="p-7 h-full flex flex-col justify-center items-center">
              <h3 className="mb-2 flex-none font-bold text-2xl">{title}</h3>
              <div className="mb-3 flex-none text-center border-t-2 border-scale-500" />
              {children}
              <div className="login-spacer"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
