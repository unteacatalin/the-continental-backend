import { useForm } from 'react-hook-form';
import { styled } from 'styled-components';

import { useCreateGuest } from './useCreateGuest';
import { useEditGuest } from './useEditGuest';
import FormRow from '../../ui/FormRow';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Form from '../../ui/Form';
import Select from '../../ui/Select';
import { useEffect, useState } from 'react';
import { nationalities } from '../../utils/nationalities';

const StyledFormRow = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 24rem 1fr 1.2fr;
  gap: 2.4rem;

  padding: 1.2rem 0;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }

  &:has(button) {
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
  }
`;

const Label = styled.label`
  font-weight: 500;
`;

const Error = styled.span`
  font-size: 1.4rem;
  color: var(--color-red-700);
`;

function CreateGuestForm({ onCloseModal, guestToEdit = {} }) {
  const { id: editId, ...editValues } = guestToEdit;
  const isEditSession = Boolean(editId);
  const options = nationalities();
  const [flag, setFlag] = useState('');
  const [nationality, setNationality] = useState('');

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: isEditSession ? editValues : {},
  });
  const { errors } = formState;

  const { createGuest, isCreating } = useCreateGuest();

  const { editGuest, isEditing } = useEditGuest();

  const isWorking = isCreating || isEditing;

  useEffect(
    function () {
      const fg = options.find(
        (option) => option.label === editValues?.nationality
      )?.value;
      setFlag(fg);
      setNationality(editValues?.nationality);
    },
    [editValues?.nationality]
  );

  function onSubmit(data) {
    if (isEditSession) {
      editGuest(
        { newGuest: data, countryFlag: flag, nationality, id: editId },
        {
          onSuccess: (data) => {
            reset();
            onCloseModal?.();
          },
        }
      );
    } else {
      createGuest(
        { newGuest: data, countryFlag: flag, nationality },
        {
          onSuccess: (data) => {
            reset();
            onCloseModal?.();
          },
        }
      );
    }
  }

  function onError(errors) {}

  function handleNationalityChange(e) {
    setFlag(e.target.value);
    const nat = options.find(
      (option) => option.value === e.target.value
    )?.label;
    setNationality(nat);
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      type={onCloseModal ? 'modal' : 'regular'}
    >
      <FormRow error={errors?.fullName?.message} label='Full name'>
        <Input
          type='text'
          id='fullName'
          disabled={isWorking}
          {...register('fullName', {
            required: 'This field is required',
          })}
        />
      </FormRow>

      <FormRow error={errors?.email?.message} label='Email'>
        <Input
          type='text'
          id='email'
          disabled={isWorking}
          {...register('email', {
            required: 'This field is required',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Plase provide a valid email address',
            },
          })}
        />
      </FormRow>

      <FormRow error={errors?.nationalID?.message} label='nationalID'>
        <Input
          type='text'
          id='nationalID'
          disabled={isWorking}
          {...register('nationalID', {
            required: 'This field is required',
          })}
        />
      </FormRow>

      <FormRow error={errors?.nationality?.message} label='Nationality'>
        <Select
          options={options}
          type='white'
          onChange={handleNationalityChange}
          value={flag}
          disabled={isWorking}
          //   id='nationality'
          //   {...register('nationality', {
          //     required: 'This field is required',
          //   })}
        />
      </FormRow>

      <StyledFormRow>
        <Button
          variation='secondary'
          type='reset'
          onClick={() => onCloseModal?.()}
          disabled={isWorking}
        >
          Cancel
        </Button>
        <Button disabled={isWorking}>
          {isEditSession ? 'Edit guest' : 'Create new guest'}
        </Button>
      </StyledFormRow>
    </Form>
  );
}

export default CreateGuestForm;
