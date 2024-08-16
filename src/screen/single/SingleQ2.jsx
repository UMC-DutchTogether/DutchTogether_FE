import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setBankName, setAccountNumber } from '../../store/singlePaySlice';
import { SinglePageContainer, QuestionContainer, SingleQ1Box, LeftArrowButton, RightArrowButton, Input, DecorationBarRight, DecorationBarRightText, SingleQText } from '../../styles/styledComponents';

export default function SingleQ2() {
  const dispatch = useDispatch();
  const { bankName, accountNumber } = useSelector((state) => state.singlePay);
  const [inputValue, setInputValue] = useState(bankName + accountNumber);

  useEffect(() => {
    // 문자열과 숫자 분리
    const bankNameMatch = inputValue.match(/^\D+/); // 문자
    const accountNumberMatch = inputValue.match(/\d+/); // 숫자

    // 각각의 값을 추출
    const newBankName = bankNameMatch ? bankNameMatch[0].trim() : '';
    const newAccountNumber = accountNumberMatch ? accountNumberMatch[0] : '';

    // store에 저장
    dispatch(setBankName(newBankName));
    dispatch(setAccountNumber(newAccountNumber));
  }, [inputValue, dispatch]);

  // 입력시 호출 함수
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 공백 확인 함수
  const isInputValid = () => {
    // accountNumber가 문자열이 아니라면 toString()으로 변환
    const accountNumberStr = accountNumber ? accountNumber.toString() : '';
    return bankName.trim() !== '' && accountNumberStr.trim() !== '';
  };

  return (
    <SinglePageContainer>
      <DecorationBarRight>
        <DecorationBarRightText>혼자 계산해요!</DecorationBarRightText>
      </DecorationBarRight>

      <QuestionContainer>
        <Link to="/SingleQ1">
          <LeftArrowButton type="button" />
        </Link>

        <SingleQ1Box>
          <SingleQText>Q.정산 금액을 받는 은행과 계좌번호를 입력해주세요.</SingleQText>
          <Input type="text" value={inputValue} onChange={handleInputChange} />
        </SingleQ1Box>

        <Link to="/SingleQ3">
          <RightArrowButton type="button" disabled={!isInputValid()} />
        </Link>
      </QuestionContainer>
    </SinglePageContainer>
  );
}