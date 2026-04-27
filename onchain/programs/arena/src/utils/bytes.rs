use pinocchio::error::ProgramError;

#[inline(always)]
pub fn read_array<const LEN: usize>(
    data: &[u8],
    offset: &mut usize,
) -> Result<[u8; LEN], ProgramError> {
    if data.len() < *offset + LEN {
        return Err(ProgramError::InvalidInstructionData);
    }

    let mut value = [0u8; LEN];
    value.copy_from_slice(&data[*offset..*offset + LEN]);
    *offset += LEN;

    Ok(value)
}

#[inline(always)]
pub fn read_u8(data: &[u8], offset: &mut usize) -> Result<u8, ProgramError> {
    if data.len() < *offset + 1 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let value = data[*offset];
    *offset += 1;

    Ok(value)
}

#[inline(always)]
pub fn read_u16(data: &[u8], offset: &mut usize) -> Result<u16, ProgramError> {
    Ok(u16::from_le_bytes(read_array::<2>(data, offset)?))
}

#[inline(always)]
pub fn read_i64(data: &[u8], offset: &mut usize) -> Result<i64, ProgramError> {
    Ok(i64::from_le_bytes(read_array::<8>(data, offset)?))
}

#[inline(always)]
pub fn write_bytes(data: &mut [u8], offset: &mut usize, value: &[u8]) -> Result<(), ProgramError> {
    if data.len() < *offset + value.len() {
        return Err(ProgramError::InvalidAccountData);
    }

    data[*offset..*offset + value.len()].copy_from_slice(value);
    *offset += value.len();

    Ok(())
}

#[inline(always)]
pub fn write_u8(data: &mut [u8], offset: &mut usize, value: u8) -> Result<(), ProgramError> {
    write_bytes(data, offset, &[value])
}

#[inline(always)]
pub fn write_u16(data: &mut [u8], offset: &mut usize, value: u16) -> Result<(), ProgramError> {
    write_bytes(data, offset, &value.to_le_bytes())
}

#[inline(always)]
pub fn write_i64(data: &mut [u8], offset: &mut usize, value: i64) -> Result<(), ProgramError> {
    write_bytes(data, offset, &value.to_le_bytes())
}

#[inline(always)]
pub fn is_all_zero(value: &[u8]) -> bool {
    value.iter().all(|byte| *byte == 0)
}

#[inline(always)]
pub fn validate_utf8_prefix(value: &[u8], len: u8) -> Result<(), ProgramError> {
    let len = len as usize;

    if len > value.len() {
        return Err(ProgramError::InvalidInstructionData);
    }

    core::str::from_utf8(&value[..len]).map_err(|_| ProgramError::InvalidInstructionData)?;

    Ok(())
}
