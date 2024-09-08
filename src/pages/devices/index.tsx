/*************************************************************************/
/*  index.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Link from 'next/link'
import Card from '@webapps-common/UI/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  IconDefinition,
  faLightbulb, faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import MainLayout from '@components/MainLayout'
import {
  PropsWithChildren, ReactElement
} from 'react'

export default function Devices() {
    return (
        <MainLayout
          breadcrumb={{
            breadcrumbCurrentText: 'Devices Administration',
          }}
        >
          <div className="tw-flex tw-flex-col tw-gap-3 tw-h-full">
            <div className="tw-prose dark:tw-prose-invert">
              <h2>Devices Administration</h2>
            </div>
    
            <div>
              <h3 className="tw-text-xl tw-mt-7">Microcontrolers</h3>
            </div>
            <div className="tw-grid md:tw-grid-cols-3 tw-gap-3 tw-justify-items-stretch">
              <LinkCard
                title="Metro Gaya WLED"
                icon={faLightbulb}
                href="https://mgs-wled.netlify.app/"
              >
                Configure WLED ESP32/Arduino Device.
              </LinkCard>
            </div>
          </div>
        </MainLayout>
      )
    }
    
    type LinkCardProps = {
      icon: IconDefinition;
      title: string;
      href: string;
    } & PropsWithChildren
    function LinkCard({
      icon,
      title,
      href,
      children,
    } : LinkCardProps) {
      return (
        <Link href={href} className="tw-no-underline tw-text-foreground">
          <Card className="tw-flex tw-flex-col">
            <Card.Body className="tw-grow tw-flex tw-gap-5 hover:tw-bg-surface-200 tw-items-center tw-transition-all">
              <div>
                <div className="tw-min-w-[3rem] tw-min-h-[3rem] tw-flex tw-items-center tw-justify-center">
                  <FontAwesomeIcon icon={icon} className="tw-h-[2rem] tw-w-[2rem]" />
                </div>
              </div>
              <div className="tw-grow">
                <Card.Title>{title}</Card.Title>
                <div className="tw-mt-2">
                  {children}
                </div>
              </div>
              <div className="tw-place-self-start">
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </Card.Body>
          </Card>
        </Link>
      )
    }
