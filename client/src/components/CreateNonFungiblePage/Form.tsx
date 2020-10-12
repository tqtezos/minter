/** @jsx jsx */
import { FC, useEffect, useState } from 'react';
import { jsx } from '@emotion/core';
import { Form, Button, message, Row, Col } from 'antd';

import { IpfsContent } from '../../api/ipfsUploader';
import { useContracts } from '../App/globalContext';
import LeftSide from './LeftSide';
import RightSide from './RightSide';

interface InputFormProps {
  onFinish: () => void;
}

const InputForm: FC<InputFormProps> = ({ onFinish }) => {
  const [ipfsContent, setIpfsContent] = useState<IpfsContent>();
  const [creatingToken, setCreatingToken] = useState(false);
  const [form] = Form.useForm();
  const contracts = useContracts();

  const handleCreateToken = async () => {
    try {
      await form.validateFields(['name', 'description', 'symbol', 'ipfsCid']);
    } catch (error) {
      message.error('Please fix the errors and try to submit again');
      return;
    }

    // This should never happen as 'Create' button is disabled until
    // the settings are received
    if (!contracts) return;

    const values = form.getFieldsValue() as any;
    console.log('Submitted values: ', values);

    setCreatingToken(true);
    const hideMessage = message.loading(
      'Creating a new non-fungible token on blockchain...',
      0
    );

    try {
      const nft = await contracts.nft();

      await nft.createToken({
        ...values,
        description: values.description || ''
      });

      setTimeout(onFinish, 0);
    } catch (error) {
      message.error(error.message, 10); // Keep for 10 seconds
    } finally {
      setCreatingToken(false);
      hideMessage();
    }
  };

  useEffect(() => {
    form.setFieldsValue({ ipfsCid: ipfsContent?.cid });
  }, [ipfsContent, form]);

  return (
    <Form form={form} layout="vertical" css={{ marginTop: '2em' }}>
      <fieldset disabled={creatingToken}>
        <Row>
          <Col span={10}>
            <LeftSide onChange={setIpfsContent} />
          </Col>
          <Col offset={2} span={10}>
            <RightSide ipfsContent={ipfsContent} form={form} />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item>
              <Button
                onClick={handleCreateToken}
                type="primary"
                loading={creatingToken}
                disabled={!contracts}
                shape="round"
                size="large"
                css={{ width: '12em' }}
              >
                Create
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </fieldset>
    </Form>
  );
};

export default InputForm;
