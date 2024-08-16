import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setReceipt } from '../../store/singlePaySlice';
import { SyncLoader } from "react-spinners";
import axios from 'axios';
import {
  SinglePageContainer, CheckContainer, CheckSinglePageTitle,
  SingleQ, SingleA, ButtonContainer, BackButton, LinkButton, SingleCost,
  ReceiptButton, LongSingleA, StyledImage, LoadingConatiner, QuestionContainer,
  DecorationBarRight, DecorationBarRightText
} from '../../styles/styledComponents';

export default function CheckSingleQ() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null); // 미리보기 상태 추가
  const { meetingName, bankName, accountNumber, accountHolder, amount, numberOfPeople, meetingNum } = useSelector((state) => state.singlePay);

  // 파일 업로드 처리
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      setReceiptPreview(URL.createObjectURL(file)); // 파일 미리보기 URL 생성
      try {
        const formData = new FormData();
        formData.append('file', file);

        // 영수증 인식 API 호출
        const response = await axios.post('https://umc.dutchtogether.com/api/receipt/recognize', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log("Receipt Recognition Response:", response.data);

        if (response.data.isSuccess) {
          setReceiptId(response.data.data.receiptId);
          dispatch(setReceipt(receiptPreview)); // 미리보기 URL을 상태로 저장
          console.log("Receipt ID:", response.data.data.receiptId);
        } else {
          alert('영수증 인식에 실패했습니다: ' + response.data.message);
        }
      } catch (err) {
        console.error('영수증 인식 요청 중 오류가 발생했습니다.', err);
        alert('영수증 인식 요청 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  // 영수증 버튼 클릭(전달)
  const handleReceiptButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 링크 생성하기 버튼
  const submitData = async () => {
    if (!receiptId) {
      alert('영수증을 먼저 첨부해 주세요.');
      return;
    }

    setLoading(true);
    try {
      // 정산 정보 API 호출
      const response = await axios.post('https://umc.dutchtogether.com/api/settlement/single', {
        meetingNum: meetingNum,
        bankName: bankName,
        accountNumber: accountNumber,
        payer: accountHolder,
        totalAmount: amount,
        numPeople: numberOfPeople,
        receiptId: receiptId
      });

      if (response.status === 200) {
        console.log(response);
        navigate('/SingleCreateLink'); // 성공 시 페이지 이동
      } else {
        alert('정산 정보 전송에 실패했습니다.');
      }
    } catch (err) {
      console.error('정산 정보 요청 중 오류가 발생했습니다.', err);
      alert('정산 정보 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/SingleQ5'); // 이전 페이지로 이동
  };

  return (
    <SinglePageContainer>
      {loading && (
        <LoadingConatiner>
          <SyncLoader />
        </LoadingConatiner>
      )}

      <DecorationBarRight>
        <DecorationBarRightText>혼자 계산해요!</DecorationBarRightText>
      </DecorationBarRight>

      <QuestionContainer>
        <CheckSinglePageTitle>정산 내용</CheckSinglePageTitle>
        <CheckContainer>
          <SingleQ>Q. 정산 모임 이름이 무엇인가요?</SingleQ>
          <SingleA>{meetingName}</SingleA>

          <SingleQ>Q. 정산 금액을 받는 은행과 계좌번호를 입력해주세요.</SingleQ>
          <LongSingleA>{bankName + " " + accountNumber}</LongSingleA>

          <SingleQ>Q. 예금주를 입력해주세요.</SingleQ>
          <SingleA>{accountHolder}</SingleA>

          <SingleQ>Q. 정산하고자 하는 금액이 얼마인가요?</SingleQ>
          <SingleCost>
            <SingleA>{amount}</SingleA>

            <ReceiptButton onClick={handleReceiptButtonClick}>영수증 첨부하기</ReceiptButton>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </SingleCost>
          {receiptPreview && (
            <StyledImage src={receiptPreview} alt="Receipt" style={{ width: '400px', height: '300px' }} />
          )}

          <SingleQ>Q. 몇 명이 정산하나요?</SingleQ>
          <SingleA>{numberOfPeople}</SingleA>

          <ButtonContainer>
            <BackButton onClick={handleBack}>뒤로가기</BackButton>
            <LinkButton onClick={submitData}>링크 생성하기</LinkButton>
          </ButtonContainer>
        </CheckContainer>
      </QuestionContainer>
    </SinglePageContainer>
  );
}
