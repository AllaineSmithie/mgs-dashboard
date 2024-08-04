/*************************************************************************/
/*  MatchmakerProfileCreate.tsx                                          */
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
import JSONFormInput from '@webapps-common/JSON/JSONFormInput'
import { Cluster } from 'src/pages/multiplayer/clusters'
import { LobbyStates, LobbyTypes } from 'src/pages/multiplayer/lobbies'
import Modal from '@webapps-common/UI/Modal'
import JSONManager from '../JSONSchemas'
import JoinsAndConstraintsEditor from './JoinsAndConstraintsEditor'

type MatchmakerProfileCreateProps = {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}
export default function MatchmakerProfileCreate({
  show,
  onClose,
  onSave = onClose,
}: MatchmakerProfileCreateProps) {
  const supabase = useSupabaseClient()
  const [clusterList, setClusterList] = useState<Cluster[]>([])

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
    query: yup
      .object()
      .test({
        test: (el) => JSONManager.validators['matchmaking-profile-query'](el),
        message: 'Query format is invalid',
      })
      .json()
      .typeError('Not a valid JSON'),
    min_players: yup.number().required('Required').min(0).integer(),
    max_players: yup
      .number()
      .required('Required')
      .positive()
      .integer()
      .min(yup.ref('min_players'), 'Must be higher that "Min Players"'),
    progressive: yup.bool().required('Required'),
    lobby_type: yup.number().required('Required').oneOf(Object.keys(LobbyTypes).map((v:string) => parseInt(v, 10)), 'Invalid lobby type'),
    lobby_cluster: yup.string().when('lobby_type', {
      is: 1,
      then: (schema) => schema.required('Required'),
    }),
    lobby_props: yup
      .object()
      .test({
        test: (el) => JSONManager.validators['matchmaking-profile-lobby_props'](el),
        message: 'Lobby properties format is invalid',
      })
      .json()
      .typeError('Not a valid JSON'),
    lobby_state: yup.number().required('Required').oneOf(Object.keys(LobbyStates).map((v:string) => parseInt(v, 10)), 'Invalid lobby state'),
    lobby_hidden: yup.bool().required('Required'),
    lobby_assign_creator: yup.bool().required('Required'),

  }
  const schema = yup.object().shape(shape).noUnknown(true)

  // Set the form initial values.
  const initialValues = Object.assign(
    Object.fromEntries(Object.keys(shape).map((e) => ([e, '']))),
    {
      query: '{\n    "constraints": {}\n}',
      min_players: '2',
      max_players: '4',
      lobby_props: '{}',
      lobby_type: '0',
      lobby_state: '1',
      progressive: false,
      lobby_hidden: false,
      lobby_assign_creator: false,
    },
  )

  // Submit the form to the server.
  const onSubmit : FormikConfig<typeof initialValues>['onSubmit'] = async (values, { resetForm }) => {
    const preparedValues = schema.cast(prepareDataForValidation(values))
    const res = await withSchema(supabase, 'w4online')
      .from('matchmaker_profile')
      .upsert(preparedValues)
    if (res.error) {
      toast.error(
        `Could not create matchmaking profile: ${res.error?.message}`,
      )
      return
    }
    toast.success('Profile successfully created')
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
          size="medium"
        >
          <Modal.Header closeButton={!isSubmitting}>
            <Modal.Title>Create a new matchmacking profile</Modal.Title>
          </Modal.Header>
          <Form noValidate onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Input
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  isInvalid={touched.name && !!errors.name}
                  placeholder="Profile name"
                  autoComplete="off"
                />
                <Form.Feedback type="invalid">
                  {errors.name}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="query">
                <JoinsAndConstraintsEditor
                  name="query"
                  defaultValue={values.query}
                  isInvalid={touched.query && !!errors.query}
                  setFieldValue={setFieldValue}
                />
                <Form.Feedback type="invalid">
                  {errors.query}
                </Form.Feedback>
              </Form.Group>

              <h4>Players</h4>
              <Form.Group className="mb-3" controlId="min_players">
                <Form.Label>Minimum number of players</Form.Label>
                <Form.Input
                  name="min_players"
                  type="number"
                  value={values.min_players}
                  onChange={handleChange}
                  isInvalid={touched.min_players && !!errors.min_players}
                  min={0}
                />
                <Form.Feedback type="invalid">
                  {errors.min_players}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="max_players">
                <Form.Label>Maximum number of players</Form.Label>
                <Form.Input
                  name="max_players"
                  type="number"
                  value={values.max_players}
                  onChange={handleChange}
                  isInvalid={touched.max_players && !!errors.max_players}
                  min={1}
                />
                <Form.Feedback type="invalid">
                  {errors.max_players}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="progressive">
                <Form.Checkbox
                  label="Progressive"
                  value="progressive"
                  checked={values.progressive}
                  onChange={handleChange}
                  isInvalid={touched.progressive && !!errors.progressive}
                />
                <Form.Feedback type="invalid">
                  {errors.progressive}
                </Form.Feedback>
                <Form.Text>
                  If progressive is enabled, the matchmaker may continue to add
                  players after the lobby has been created.
                  <br />
                  <strong>Note: This feature isn&apos;t implemented yet.</strong>
                </Form.Text>
              </Form.Group>

              <h4>Lobby</h4>

              <Form.Group className="mb-3" controlId="lobby_type">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="lobby_type"
                  value={values.lobby_type}
                  onChange={handleChange}
                  isInvalid={touched.lobby_type && !!errors.lobby_type}
                  items={Object.entries(LobbyTypes).map(([key, value]) => ({
                    name: value,
                    value: key.toString(),
                  }))}
                  placeholder="Select a lobby type"
                />
                <Form.Feedback type="invalid">
                  {errors.lobby_type}
                </Form.Feedback>
              </Form.Group>
              {
                values.lobby_type === '4'
                && (
                <Alert variant="warning">
                  This lobby type is experimental, its use is discouraged.
                </Alert>
                )
              }
              {
                values.lobby_type === '1'
                && (
                  clusterList.length === 0 ? (
                    <Alert variant="warning">
                      No cluster is available: you will not be able to create a
                      matchmaker profile as using dedicated game servers without
                      assigning it a valid cluster.
                    </Alert>
                  )
                    : (
                      <Form.Group className="mb-3" controlId="lobby_cluster">
                        <Form.Label>Cluster</Form.Label>
                        <Form.Select
                          name="lobby_cluster"
                          value={values.lobby_cluster}
                          onChange={handleChange}
                          isInvalid={touched.lobby_cluster && !!errors.lobby_cluster}
                          items={clusterList.map((el) => ({
                            name: el.name,
                            value: el.name,
                          }))}
                          placeholder="Select a cluster"
                        />
                        <Form.Feedback type="invalid">
                          {errors.lobby_cluster}
                        </Form.Feedback>
                      </Form.Group>
                    )
                )
              }

              <Form.Group className="mb-3" controlId="lobby_props">
                <Form.Label>Lobby properties</Form.Label>
                <JSONFormInput
                  name="lobby_props"
                  defaultValue={values.lobby_props}
                  isInvalid={touched.lobby_props && !!errors.lobby_props}
                  setFieldValue={setFieldValue}
                  jsonSchemaId="matchmaking-profile-lobby_props"
                  jsonSchemaManager={JSONManager}
                />
                <Form.Feedback type="invalid">
                  {errors.lobby_props}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="lobby_state">
                <Form.Label>Default lobby state</Form.Label>
                <Form.Select
                  name="lobby_state"
                  value={values.lobby_state}
                  onChange={handleChange}
                  isInvalid={touched.lobby_state && !!errors.lobby_state}
                  items={Object.entries(LobbyStates).map(([key, value]) => ({
                    name: value,
                    value: key.toString(),
                  }))}
                  placeholder="Select a lobby state"
                />
                <Form.Feedback type="invalid">
                  {errors.lobby_state}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="lobby_hidden">
                <Form.Checkbox
                  label="Private lobby"
                  value="lobby_hidden"
                  checked={values.lobby_hidden}
                  onChange={handleChange}
                  isInvalid={touched.lobby_hidden && !!errors.lobby_hidden}
                />
                <Form.Feedback type="invalid">
                  {errors.lobby_hidden}
                </Form.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="lobby_assign_creator">
                <Form.Checkbox
                  label="Assign creator"
                  value="lobby_assign_creator"
                  checked={values.lobby_assign_creator}
                  onChange={handleChange}
                  isInvalid={touched.lobby_assign_creator && !!errors.lobby_assign_creator}
                />
                <Form.Feedback type="invalid">
                  {errors.lobby_assign_creator}
                </Form.Feedback>
                <Form.Text>
                  If enabled, the matchmaker will automatically assign one player
                  as the lobby&apos;s creator, allowing them to update the lobby.
                </Form.Text>
              </Form.Group>
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
