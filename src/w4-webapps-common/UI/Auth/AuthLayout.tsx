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
  backgroundImageHref = '/assets/img/snes-controllers.jpg',
  children,
} : AuthLayoutProps) {
  const contentBackground = addBasePath(backgroundImageHref)
  const logo = addBasePath(logoHref)

  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta name="description" content="W4 Dashboard" />
        <link rel="icon" href={addBasePath('/favicon.ico')} />
      </Head>
      <div
        className={`
          dark:tw-bg-[radial-gradient(circle_at_center,_rgb(46,44,59)_0%,_rgb(34,33,41)_100%)]
          tw-bg-[radial-gradient(circle_at_center,_rgb(195,194,200)_0%,_rgb(163,161,175)_100%)]
          tw-bg-[position:center]
          tw-bg-[length:100%]
          tw-bg-no-repeat
          tw-h-screen tw-flex tw-items-center tw-justify-center
        `}
      >
        <div className={`
          tw-min-w-full
          md:tw-min-w-[768px] md:tw-max-w-[768px]
          md:tw-min-h-[470px] tw-min-h-full
          md:tw-rounded-md
          tw-overflow-hidden
          tw-grid md:tw-grid-cols-2 tw-grid-cols-1
          `}
        >
          <div
            style={{
              '--content-background': `url(${contentBackground})`,
            } as React.CSSProperties}
            className={`
            tw-bg-[image:var(--content-background)]
            tw-bg-cover
            tw-hidden
            md:tw-flex tw-flex-col
            tw-items-center
            `}
          >
            <div
              className="tw-p-7 tw-flex tw-flex-col tw-items-center"
            >
              <Image
                src={logo}
                width={200}
                height={50}
                alt="W4Games logo"
              />
              <h2 className="tw-mt-6 tw-font-bold tw-text-scale-300 tw-text-2xl">
                {appTitle}
              </h2>
            </div>
          </div>

          <div className="tw-flex-1 tw-bg-surface-100">
            <div
              style={{
                '--content-background': `url(${contentBackground})`,
              } as React.CSSProperties}
              className={`
              tw-p-10
              tw-bg-[image:var(--content-background)]
              tw-bg-cover
              tw-flex tw-flex-col
              tw-items-center
              tw-flex-1
              md:tw-hidden
              tw-visible
              `}
            >
              <Image
                src={logo}
                width={200}
                height={50}
                alt="W4Games logo"
              />
            </div>
            <div className="tw-p-7 tw-h-full tw-flex tw-flex-col">
              <h3 className="tw-mb-2 tw-flex-none tw-font-bold tw-text-2xl">{title}</h3>
              <div className="tw-mb-3 tw-flex-none tw-text-center tw-border-t-2 tw-border-scale-500" />
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
