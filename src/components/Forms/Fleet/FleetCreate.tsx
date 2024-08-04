/*************************************************************************/
/*  FleetCreate.tsx                                                      */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Button from '@webapps-common/UI/Button'
import SubmitButton from '@webapps-common/UI/SubmitButton'
import Form from '@webapps-common/UI/Form/Form'
import Alert from '@webapps-common/UI/Alert'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Formik, FormikConfig, prepareDataForValidation } from 'formik'
import * as yup from 'yup'
import withSchema from 'src/utils/withSchema'
import { Build } from 'src/pages/multiplayer/builds'
import { Cluster } from 'src/pages/multiplayer/clusters'
import Modal from '@webapps-common/UI/Modal'
import JSONManager from '../JSONSchemas'

type FleetCreateProps = {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  fleetLabelsKeys: string[];
}
export default function FleetCreate({
  show,
  onClose,
  onSave = onClose,
  fleetLabelsKeys,
}: FleetCreateProps) {
  const supabase = useSupabaseClient()
  const [buildList, setBuildList] = useState<Build[]>([])
  const [clusterList, setClusterList] = useState<Cluster[]>([])

  // Get the list of builds
  const fetchBuildList = useCallback(async () => {
    const res = await withSchema(supabase, 'w4online').rpc(
      'gameserver_build_get_all',
    )
    if (res.error) {
      toast.error(`Could not retrieve the build list: ${res.error?.message}`)
      return
    }
    setBuildList(res.data as Build[])
  }, [supabase])

  useEffect(() => {
    fetchBuildList()
  }, [fetchBuildList])

  // Get the list of clusters
  const fetchClusterList = useCallback(async () => {
    const res = await withSchema(supabase, 'w4online')
      .from('cluster')
      .select('*')
      .eq('deleted', false)
      .order('name')
    if (res.error) {
      toast.error(`Could not retrieve the cluster list: ${res.error?.message}`)
      return
    }
    setClusterList(res.data as Cluster[])
  }, [supabase])

  useEffect(() => {
    fetchClusterList()
  }, [fetchClusterList])

  // Set the form validation schema.
  const shape = {
    name: yup.string().required('Required'),
    cluster: yup.string().required('Required'),
    build_id: yup.string().required('Required'),
    image: yup.string().nullable().default(null),
    port: yup.number().required('Required').positive().integer(),
    env: yup.object().json().typeError('Not a valid JSON').default({}),
    labels: yup
      .object()
      .test({
        test: (el) => JSONManager.validators['fleet-labels'](el),
        message: 'Labels format is invalid',
      })
      .json()
      .typeError('Not a valid JSON'),
    min_replicas: yup.number().required('Required').positive().integer(),
    autoscale: yup.bool().default(false),
    max_replicas: yup.number().when('autoscale', {
      is: true,
      then: (schema) => (
        schema.required('Required')
          .positive()
          .integer()
          .min(
            yup.ref('min_replicas'),
            'Must be higher than the "Minimum number of servers"',
          )
      ),
    }),
    buffer_size: yup.number().when('autoscale', {
      is: true,
      then: (schema) => (
        schema.required('Required')
          .positive()
          .integer()
          .lessThan(
            yup.ref('max_replicas'),
            'Must be lower that "Maximum number of servers"',
          )
          .max(
            yup.ref('min_replicas'),
            'Must be lower or equal to "Minimum number of servers"',
          )
      ),
    }),
    autoscaling_interval: yup.number().when('autoscale', {
      is: true,
      then: (schema) => (
        schema.required('Required').positive().integer()
      ),
    }),
  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {
      labels: '{}',
      autoscale: false,
      min_replicas: '1',
      max_replicas: '5',
      buffer_size: '1',
      autoscaling_interval: '30',
    },
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values, { resetForm }) => {
    // Create
    const preparedValues = schema.cast(prepareDataForValidation(values))
    if (!preparedValues.autoscale) {
      preparedValues.max_replicas = 0
      preparedValues.buffer_size = 0
      preparedValues.autoscaling_interval = 30
    }
    const res = await withSchema(supabase, 'w4online').rpc(
      'fleet_create',
      preparedValues,
    )
    if (res.error) {
      toast.error(`Could not create fleet: ${res.error.message}`)
      return
    }
    toast.success('Fleet successfully created')
    onSave()
    resetForm()
  }

  return (
    <Formik
      key={JSON.stringify(initialValues)} // Hack to force a rerender :/
      enableReinitialize
      validationSchema={schema}
      initialValues={initialValues}
      onSubmit={onSubmit}
      data-bs-theme="light"
    >
      {({
        handleSubmit,
        handleChange,
        values,
        touched,
        isSubmitting,
        errors,
        setFieldValue,
      }) => (
        <Modal
          show={show}
          onHide={isSubmitting ? undefined : onClose}
          backdrop="static"
        >
          <Modal.Header closeButton={!isSubmitting}>
            <Modal.Title>
              Create a new fleet
            </Modal.Title>
          </Modal.Header>
          <Form noValidate onSubmit={handleSubmit}>
            <Modal.Body>
              {buildList.length === 0 && (
                <Alert variant="warning">
                  No build was configured: you will not be able to create a
                  fleet without assigning it a valid build.
                </Alert>
              )}
              {clusterList.length === 0 && (
                <Alert variant="warning">
                  No cluster is available: you will not be able to create a
                  fleet without assigning it a valid cluster.
                </Alert>
              )}
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Input
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  isInvalid={touched.name && !!errors.name}
                />
                <Form.Feedback type="invalid">
                  {errors.name}
                </Form.Feedback>
                <Form.Text>
                  This name will be used to identify this fleet. It must be
                  unique amongst the fleet set.
                  <br />
                  Choose it carefully, it cannot be modified later on.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3" controlId="cluster">
                <Form.Label>Cluster</Form.Label>
                <Form.Select
                  name="cluster"
                  value={values.cluster}
                  onChange={handleChange}
                  isInvalid={touched.cluster && !!errors.cluster}
                  placeholder="Select a cluster"
                  items={clusterList ? clusterList.map(({ name }) => ({ name, value: name })) : []}
                />
                <Form.Feedback type="invalid">
                  {errors.cluster}
                </Form.Feedback>
                <Form.Text>
                  A fleet&apos;s cluster cannot be modified later on.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3" controlId="build_id">
                <Form.Label>Build</Form.Label>
                <Form.Select
                  name="build_id"
                  value={values.build_id}
                  onChange={handleChange}
                  isInvalid={touched.build_id && !!errors.build_id}
                  placeholder="Select a build"
                  items={buildList ? buildList.map(({ name, id }) => ({ name, value: id })) : []}
                />
                <Form.Feedback type="invalid">
                  {errors.build_id}
                </Form.Feedback>
              </Form.Group>

              <input
                type="hidden"
                id="image"
                name="image"
                value={initialValues.image || undefined}
              />

              <Form.Group className="mb-3" controlId="port">
                <Form.Label>Port</Form.Label>
                <Form.Input
                  name="port"
                  type="number"
                  value={values.port}
                  onChange={handleChange}
                  isInvalid={touched.port && !!errors.port}
                  min={1}
                />
                <Form.Feedback type="invalid">
                  {errors.port}
                </Form.Feedback>
              </Form.Group>

              <input
                type="hidden"
                id="env"
                name="env"
                value={JSON.stringify(initialValues.env)}
              />

              <Form.Group className="mb-3" controlId="labels">
                <Form.Label>Labels</Form.Label>
                <Form.KeyValueEditor
                  name="labels"
                  defaultValue={values.labels}
                  isInvalid={touched.labels && !!errors.labels}
                  setFieldValue={setFieldValue}
                  dropdownKeys={fleetLabelsKeys}
                />
                <Form.Feedback type="invalid">
                  {errors.labels}
                </Form.Feedback>
              </Form.Group>

              <Form.Separator />

              <Form.Group className="mb-3" controlId="autoscale">
                <Form.Checkbox
                  label="Automatically scale the number of servers"
                  name="autoscale"
                  checked={values.autoscale}
                  onChange={handleChange}
                  isInvalid={touched.autoscale && !!errors.autoscale}
                />
                <Form.Feedback type="invalid">
                  {errors.autoscale}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="min_replicas">
                <Form.Label>{values.autoscale ? 'Minimum number of servers' : 'Number of servers'}</Form.Label>
                <Form.Input
                  name="min_replicas"
                  type="number"
                  value={values.min_replicas}
                  onChange={handleChange}
                  isInvalid={touched.min_replicas && !!errors.min_replicas}
                  min={1}
                />
                <Form.Feedback type="invalid">
                  {errors.min_replicas}
                </Form.Feedback>
              </Form.Group>
              {values.autoscale
              && (
                <>
                  <Form.Group className="mb-3" controlId="max_replicas">
                    <Form.Label>Maximum number of servers</Form.Label>
                    <Form.Input
                      name="max_replicas"
                      type="number"
                      value={values.max_replicas}
                      onChange={handleChange}
                      isInvalid={touched.max_replicas && !!errors.max_replicas}
                      min={1}
                    />
                    <Form.Feedback type="invalid">
                      {errors.max_replicas}
                    </Form.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="buffer_size">
                    <Form.Label>Buffer size</Form.Label>
                    <Form.Input
                      name="buffer_size"
                      type="number"
                      value={values.buffer_size}
                      onChange={handleChange}
                      isInvalid={touched.buffer_size && !!errors.buffer_size}
                      min={1}
                    />
                    <Form.Feedback type="invalid">
                      {errors.buffer_size}
                    </Form.Feedback>
                    <Form.Text>
                      The number of extra servers to keep ready.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="autoscaling_interval">
                    <Form.Label>Autoscaling interval (in seconds)</Form.Label>
                    <Form.Input
                      name="autoscaling_interval"
                      type="number"
                      value={values.autoscaling_interval}
                      onChange={handleChange}
                      isInvalid={
                        touched.autoscaling_interval
                        && !!errors.autoscaling_interval
                      }
                      placeholder="30"
                      min={0}
                    />
                    <Form.Feedback type="invalid">
                      {errors.autoscaling_interval}
                    </Form.Feedback>
                    <Form.Text>
                      How often the autoscaler should count the number of servers
                      and launch or shutdown some according to the rules above.
                    </Form.Text>
                  </Form.Group>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Close
              </Button>
              <SubmitButton variant="primary" isSubmitting={isSubmitting}>
                Save changes
              </SubmitButton>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Formik>
  )
}
