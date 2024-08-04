/*************************************************************************/
/*  api.tsx                                                              */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { GetServerSideProps } from 'next'
import Link from 'next/link'
import MainLayout from '@components/MainLayout'
import { useState } from 'react'
import Button from '@webapps-common/UI/Button'
import { useRuntimeEnvVars } from '@webapps-common/utils/runtimeEnvVarsEndpoint'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

type APIProps = {
  anonKey: string;
  serviceKey: string;
}

export const getServerSideProps: GetServerSideProps<APIProps> = async () => {
  const anonKey = process.env.RUNTIME_PUBLIC_SUPABASE_ANON_KEY as string
  const serviceKey = process.env.SUPABASE_SERVICE_KEY as string
  return { props: { anonKey, serviceKey } }
}

function KeyBox({
  title,
  value,
} : {
  title: string;
  value: string;
}) {
  const [show, setShow] = useState<boolean>(false)

  return (
    <div className="border-2 border-solid rounded-lg border-border mt-5">
      <div className="border-0 border-b-2 border-solid border-border">
        <div className="flex">
          <h5 className="grow p-3 ms-2 m-auto">{title}</h5>
          <Button
            className="shrink p-3 m-2 leading-none"
            onClick={() => {
              navigator.clipboard.writeText(value)
              toast.info('Copied the key to the clipboard!')
            }}
          >
            <FontAwesomeIcon icon={faCopy} />
            {' '}
            Copy
          </Button>
          <Button
            className="shrink p-3 m-2 w-10"
            onClick={() => { setShow(!show) }}
          >
            <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
          </Button>
        </div>
      </div>
      <div className="p-3 break-all">
        {show ? value : '*'.repeat(value.length)}
      </div>
    </div>
  )
}

export default function Api({ anonKey, serviceKey }: APIProps) {
  const envVars = useRuntimeEnvVars()

  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Docs' }],
        breadcrumbCurrentText: 'API',
      }}
    >
      <div className="prose dark:prose-invert">
        <h2 className="p-3">Documentation</h2>

        The w4gd documentation is available
        {' '}
        <Link href={envVars?.env.RUNTIME_PUBLIC_API_DOCS_URL || ''}>
          here
        </Link>
      </div>
      <div className="mt-6">
        <h3 className="p-3">API keys</h3>
        <KeyBox
          title="Anonymous API key"
          value={anonKey}
        />
        <KeyBox
          title="Service API key"
          value={serviceKey}
        />
      </div>
    </MainLayout>
  )
}
