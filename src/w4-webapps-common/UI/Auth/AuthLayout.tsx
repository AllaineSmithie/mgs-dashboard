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
  logoHref = '/assets/brand/mgs.svg',
  backgroundImageHref = '/assets/img/mgs-background.png,
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
          dark:tw-bg-[linear-gradient(to_right,_rgb(19,16,14)_35%,_rgb(44,43,43)_75%)]
          tw-bg-[radial-gradient(circle_at_center,_rgb(200,194,194)_0%,_rgb(175,163,161)_100%)]
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
            tw-justify-center
            `}
          >
            <div
              className="tw-p-7 tw-flex tw-flex-col tw-items-center"
            >
              <Image
                src={logo}
                width={200}
                height={50}
                alt="Metro Gaya logo"
              />
              <h2 className="tw-mt-6 tw-font-bold tw-text-scale-300 tw-text-2xl">
                {appTitle}
              </h2>
            </div>
          </div>

          <div className="tw-flex-1 tw-bg-scale-900">
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
            tw-justify-center
              tw-flex-1
              md:tw-hidden
              tw-visible
              `}
            >
              <Image
                src={logo}
                width={200}
                height={50}
                alt="Metro Gaya logo"
              />
            </div>
            <div className="tw-p-7 tw-h-full tw-flex tw-flex-col tw-justify-center">
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
