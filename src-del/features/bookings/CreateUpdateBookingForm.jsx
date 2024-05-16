import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

import Form from '../../ui/Form';
import { useUpdateBooking } from './useUpdateBooking';
import { useCreateBooking } from './useCreateBooking';
import Button from '../../ui/Button';
import FormRow from '../../ui/FormRow';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Checkbox from '../../ui/Checkbox';
import Textarea from '../../ui/Textarea';
import DtPicker from '../../ui/DtPicker';
import { useAllGuests } from '../guests/useAllGuests';
import { useBookedRoomsInInterval } from '../cabins/useBookedRoomsInInterval';
import { useCreateUpdateBooking } from '../../context/CreateUpdateBookingContext';
import { useRooms } from '../cabins/useRooms';
import { useSettings } from '../settings/useSettings';
import { subtractDates } from '../../utils/helpers';

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

function CreateUpdateBookingForm({ onCloseModal, bookingToEdit = {} }) {
  const { id: editId, ...editValues } = bookingToEdit;
  const isEditSession = Boolean(editId);
  // const statusOptions = statuses();
  const { isLoading: isLoadingGuests, guests } = useAllGuests();
  const { updateStartDate, updateEndDate, updateBookingId } =
    useCreateUpdateBooking();
  const { isLoading: isLoadingRooms, rooms } = useRooms();
  const { isLoading: isLoadingSettings, settings } = useSettings();
  const [roomOptions, setRoomOptions] = useState([]);

  // const [bookingStatus, setBookingStatus] = useState(
  //   editValues.status ?? statusOptions[0].value
  // );
  const [bookingHasBreakfast, setBookingHasBreakfast] = useState(
    editValues.hasBreakfast ?? false
  );
  const [bookingIsPaid, setBookingIsPaid] = useState(
    editValues.isPaid ?? false
  );
  const [bookingObservations, setBookingObservations] = useState(
    editValues.observations ?? ''
  );
  const [bookingStartDate, setBookingStartDate] = useState(
    isEditSession ? new Date(editValues?.startDate) : new Date()
  );
  const [bookingEndDate, setBookingEndDate] = useState(
    isEditSession
      ? new Date(editValues?.endDate)
      : new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [bookRoom, setBookRoom] = useState(
    isEditSession
      ? rooms?.find((room) => editValues.roomId === room.id)
      : rooms?.at(0)
  );

  const { isLoading: isLoadingBookedRooms, bookedRooms } =
    useBookedRoomsInInterval();

  const [numNights, setNumNights] = useState(editValues.numNights ?? 1);
  const [bookingGuestId, setBookingGuestId] = useState(
    editValues.guestId ?? undefined
  );
  const [guestOptions, setGuestOptions] = useState([]);

  const { register, handleSubmit, reset, formState, setValue, getValues } =
    useForm({
      defaultValues: isEditSession ? editValues : {},
    });
  const bookingValues = getValues();
  const [numGuests, setNumGuests] = useState(bookingValues?.numGuests ?? 1);
  const [roomPrice, setRoomPrice] = useState(
    isEditSession ? bookingValues?.roomPrice : 1
  );
  const [extrasPrice, setExtrasPrice] = useState(
    isEditSession ? bookingValues?.extrasPrice : 0
  );

  const { errors } = formState;

  const { createBooking, isCreating } = useCreateBooking();

  const { updateBooking, isUpdating } = useUpdateBooking();

  const isWorking =
    isCreating ||
    isUpdating ||
    isLoadingGuests ||
    isLoadingBookedRooms ||
    isLoadingRooms ||
    isLoadingSettings;

  useEffect(
    function () {
      if (bookingStartDate && bookingEndDate) {
        setNumNights(
          subtractDates(
            new Date(bookingEndDate.setUTCHours(0, 0, 0, 0)).toISOString(),
            new Date(bookingStartDate.setUTCHours(0, 0, 0, 0)).toISOString()
          )
        );
        updateStartDate(new Date(bookingEndDate.setUTCHours(0, 0, 0, 0)));
        updateEndDate(new Date(bookingStartDate.setUTCHours(0, 0, 0, 0)));
      }
    },
    [bookingStartDate, bookingEndDate]
  );

  useEffect(
    function () {
      if (Array.isArray(rooms) && Array.isArray(bookedRooms)) {
        setRoomOptions(
          rooms
            .filter(
              (room) =>
                !bookedRooms
                  .map((bookedRoom) => bookedRoom.roomId)
                  .includes(room.id)
            )
            .map((room) => {
              return {
                label: `${room.name} | max capacity: ${room.maxCapacity}`,
                value: `${room.id}`,
              };
            })
        );
      }
    },
    [rooms, bookedRooms]
  );

  useEffect(
    function () {
      if (Array.isArray(rooms) && editValues?.roomId) {
        setBookRoom(rooms.find((room) => room.id === editValues.roomId));
      }
    },
    [rooms, editValues?.roomId]
  );

  useEffect(
    function () {
      if (Array.isArray(rooms) && !isEditSession) {
        setBookRoom(rooms.at(0));
      }
    },
    [rooms, isEditSession]
  );

  useEffect(
    function () {
      if (
        bookRoom?.regularPrice &&
        bookRoom?.discount &&
        numNights &&
        editValues?.roomPrice
      ) {
        setRoomPrice(
          numNights * (bookRoom.regularPrice - bookRoom.discount) >
            editValues.roomPrice
            ? numNights * (bookRoom.regularPrice - bookRoom.discount)
            : editValues.roomPrice
        );
        setValue(
          'roomPrice',
          numNights * (bookRoom.regularPrice - bookRoom.discount) >
            editValues.roomPrice
            ? numNights * (bookRoom.regularPrice - bookRoom.discount)
            : editValues.roomPrice,
          {
            shouldValidate: true,
          }
        );
      } else if (bookRoom?.regularPrice && bookRoom?.discount && numNights) {
        setRoomPrice(numNights * (bookRoom.regularPrice - bookRoom.discount));
        setValue(
          'roomPrice',
          numNights * (bookRoom.regularPrice - bookRoom.discount),
          {
            shouldValidate: true,
          }
        );
      }
    },
    [
      bookRoom?.regularPrice,
      bookRoom?.discount,
      numNights,
      editValues?.roomPrice,
    ]
  );

  useEffect(
    function () {
      if (settings?.breakfastPrice && numGuests && numNights) {
        setExtrasPrice(
          numGuests *
            numNights *
            (bookingHasBreakfast ? settings.breakfastPrice : 0)
        );
        setValue(
          'extrasPrice',
          numGuests *
            numNights *
            (bookingHasBreakfast ? settings.breakfastPrice : 0),
          {
            shouldValidate: true,
          }
        );
      }
    },
    [settings?.breakfastPrice, numNights, bookingHasBreakfast, numGuests]
  );

  useEffect(
    function () {
      if (guests) {
        setGuestOptions(
          guests.map((guest) => {
            return {
              label: `${guest.fullName} | ${guest.email} | ${guest.nationalID}`,
              value: `${guest.id}`,
            };
          })
        );
      }
    },
    [guests]
  );

  useEffect(
    function () {
      if (editId) {
        updateBookingId(editId);
      }
    },
    [editId]
  );

  function onSubmit(data) {
    if (isEditSession) {
      updateBooking(
        {
          newBooking: {
            ...data,
            // status: bookingStatus,
            hasBreakfast: bookingHasBreakfast,
            isPaid: bookingIsPaid,
            totalPrice: Number(roomPrice) + Number(data.extrasPrice),
            observations: bookingObservations,
            startDate: bookingStartDate.setUTCHours(15, 0, 0, 0),
            endDate: bookingEndDate.setUTCHours(12, 0, 0, 0),
            numNights,
            roomId: bookRoom.id,
            guestId: bookingGuestId,
          },
          id: editId,
        },
        {
          onSuccess: (data) => {
            reset();
            onCloseModal?.();
          },
        }
      );
    } else {
      createBooking(
        {
          ...data,
          // status: bookingStatus,
          hasBreakfast: bookingHasBreakfast,
          isPaid: bookingIsPaid,
          totalPrice: Number(data.roomPrice) + Number(data.extrasPrice),
          observations: bookingObservations,
          startDate: bookingStartDate.setUTCHours(15, 0, 0, 0),
          endDate: bookingEndDate.setUTCHours(12, 0, 0, 0),
          numNights,
          roomId: bookRoom.id,
          guestId: bookingGuestId,
          created_at: new Date().setUTCHours(0, 0, 0, 0),
          status: 'unconfirmed',
        },
        {
          onSuccess: (data) => {
            reset();
            onCloseModal?.();
          },
        }
      );
    }
  }

  function onError(errors) {
    // console.error({errors});
  }

  function handleHasBreakfastChange(e) {
    setBookingHasBreakfast((breakfast) => !breakfast);
  }

  function handleIsPaidChange(e) {
    setBookingIsPaid((paid) => !paid);
  }

  function handleObservationsChange(e) {
    setBookingObservations(e.target.value);
  }

  function handleStartDateChange(date) {
    setBookingStartDate(new Date(date));
    updateStartDate(new Date(date));
  }

  function handleEndDateChange(date) {
    setBookingEndDate(new Date(date));
    updateEndDate(new Date(date));
  }

  function handleRoomChange(e) {
    if (Array.isArray(rooms)) {
      const selectedRoom = rooms.find(
        (room) => room.id === Number(e.target.value)
      );
      setBookRoom(selectedRoom);
    }
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      type={onCloseModal ? 'modal' : 'regular'}
    >
      <FormRow error={errors?.startDate?.message} label='Start date'>
        <DtPicker
          portalId='root-portal'
          selected={bookingStartDate}
          onChange={handleStartDateChange}
          dropdownMode='select'
          disabled={isWorking}
        />
      </FormRow>

      <FormRow error={errors?.endDate?.message} label='End date'>
        <DtPicker
          portalId='root-portal'
          selected={bookingEndDate}
          onChange={handleEndDateChange}
          dropdownMode='select'
          disabled={isWorking}
        />
      </FormRow>

      <FormRow error={errors?.numGuests?.message} label='Number of guests'>
        <Input
          type='text'
          id='numGuests'
          disabled={isWorking}
          value={numGuests}
          {...register('numGuests', {
            required: 'This field is required',
            min: {
              value: 1,
              message: 'Number of guests should be at least 1',
            },
            max: {
              value: bookRoom?.maxCapacity,
              message: `Number of guests should not be above room capacity (${bookRoom?.maxCapacity})`,
            },
            onChange: (e) => setNumGuests(e.target.value),
          })}
        />
      </FormRow>

      <FormRow error={errors?.roomPrice?.message} label='Room price'>
        <Input
          type='text'
          id='roomPrice'
          value={roomPrice}
          disabled={isWorking}
          {...register('roomPrice', {
            required: 'This field is required',
            min: {
              value:
                Number(bookRoom?.regularPrice) - Number(bookRoom?.discount) ??
                1,
              message: `Room price should not be less then regular price after discount (${
                Number(bookRoom?.regularPrice) - Number(bookRoom?.discount) ?? 1
              } for ${numNights} nights)`,
            },
            onChange: (e) => setRoomPrice(Number(e.target.value)),
          })}
        />
      </FormRow>

      <FormRow error={errors?.extrasPrice?.message} label='Extras price'>
        <Input
          type='text'
          id='extrasPrice'
          value={extrasPrice}
          disabled={isWorking}
          {...register('extrasPrice', {
            required: 'This field is required',
            min: {
              value: 0,
              message: 'Extras price should be at least 0',
            },
            onChange: (e) => setExtrasPrice(Number(e.target.value)),
          })}
        />
      </FormRow>

      <FormRow error={errors?.status?.message} label='Status'>
        <Input
          type='text'
          id='status'
          value={isEditSession ? editValues?.status : 'unconfirmed'}
          editable='false'
          disabled={true}
        />
      </FormRow>

      <FormRow error={errors?.hasBreakfast?.message} label='Has breakfast?'>
        <Checkbox
          checked={bookingHasBreakfast}
          onChange={handleHasBreakfastChange}
          disabled={isWorking}
          id='hasBreakfast'
        >
          {''}
        </Checkbox>
      </FormRow>

      <FormRow error={errors?.isPaid?.message} label='Is paid?'>
        <Checkbox
          checked={bookingIsPaid}
          onChange={handleIsPaidChange}
          disabled={isWorking}
          id='isPaid'
        >
          {''}
        </Checkbox>
      </FormRow>

      <FormRow error={errors?.observations?.observations} label='Observations'>
        <Textarea
          value={bookingObservations}
          onChange={handleObservationsChange}
        />
      </FormRow>

      <FormRow error={errors?.guestId?.message} label='Guest'>
        <Select
          options={guestOptions}
          type='white'
          onChange={(e) => setBookingGuestId(e.target.value)}
          value={bookingGuestId}
          disabled={isWorking}
        />
      </FormRow>

      <FormRow error={errors?.roomId?.message} label='Room'>
        <Select
          options={roomOptions}
          type='white'
          onChange={handleRoomChange}
          value={bookRoom?.id}
          disabled={isWorking}
        />
      </FormRow>

      <StyledFormRow>
        <Button
          variant='secondary'
          type='reset'
          onClick={() => onCloseModal?.()}
          disabled={isWorking}
        >
          Cancel
        </Button>
        <Button disabled={isWorking}>
          {isEditSession ? 'Edit booking' : 'Create new booking'}
        </Button>
      </StyledFormRow>
    </Form>
  );
}

export default CreateUpdateBookingForm;
