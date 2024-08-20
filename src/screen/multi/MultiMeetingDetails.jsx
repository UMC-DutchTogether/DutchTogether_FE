import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import axios from 'axios';
import copyIcon from '../../assets/복사아이콘.png';

import {
  SingleDetailContainer,
  MeetingNameText,
  MeetingNameText2,
  MultiMeetingDetailContainer,
  MultiMeetingDetailInfo,
  PayersContainer,
  MultiMeetingDetailHeader,
  MeetingDetailMeetingName,
  Column,
  LongColumn,
  TransferButton,
  RowItemHeader,
  LongRowItemHeader,
  BigNextButton
} from '../../styles/styledComponents';

// RowItem 컴포넌트
function RowItem({ payerName, amount, bankInfo, accountNum }) {
  return (
    <div style={{ width: "100%", display: 'flex' }}>
      <Column>{payerName}</Column>
      <Column>{amount} 원</Column>
      <Column>{bankInfo}</Column>
      <LongColumn>
        <div style={{ marginLeft: '10px' }}>{accountNum}</div>
        <div style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
          <CopyToClipboard text={accountNum} onCopy={() => alert('복사 성공!')}>
            <img src={copyIcon} alt="Copy Icon" style={{ cursor: 'pointer', width: '25px', height: '25px' }} />
          </CopyToClipboard>
          <TransferButton>송금하기</TransferButton>
        </div>
      </LongColumn>
    </div>
  );
}

// MultiMeetingDetails 컴포넌트
export default function MultiMeetingDetails() {
  const { link, settlerId } = useParams();
  const [payerInfos, setPayerInfos] = useState([]);
  const [meetingName, setMeetingName] = useState('');

  // 정산자 정보 받는 API 호출
  const getInfo = async (settlerId) => {
    try {
      const response = await axios.get(`https://umc.dutchtogether.com/api/payers/info/${settlerId}`);
      const responsePayerInfos = response.data.data.payerInfos;
      console.log('정산자 정보 받기:', responsePayerInfos);
      setPayerInfos(responsePayerInfos);
    } catch (error) {
      console.error('정산자 정보 가져오기 오류:', error);
    }
  };

  // 팀 이름 받는 API 호출
  const getSettler = async (link) => {
    try {
      const response = await axios.get(`https://umc.dutchtogether.com/api/settler/${link}`);
      const responseMeetingName = response.data.data.meetingName;
      console.log('정산 모임 이름:', responseMeetingName);
      setMeetingName(responseMeetingName);
    } catch (error) {
      console.error('팀 이름 가져오기 오류:', error);
    }
  };

  useEffect(() => {
    getSettler(link);
    getInfo(settlerId);
  }, [link, settlerId]);

  return (
    <SingleDetailContainer>
      <div style={{ margin: "76px", width: '90%', minWidth: '1400px' }}>
        <MeetingNameText style={{ padding: "0px 0px 50px 0px" }}>
          <MeetingDetailMeetingName>{meetingName}</MeetingDetailMeetingName>
          <MeetingNameText2>의 정산 요청이 왔습니다.</MeetingNameText2>
        </MeetingNameText>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MultiMeetingDetailInfo style={{ display: 'flex', flexDirection: "column", alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '34px', margin: '30px 0px 30px 0px' }}>
              <MultiMeetingDetailHeader>
                내가 정산해야할 사람은
              </MultiMeetingDetailHeader>
              <PayersContainer>
                {payerInfos.map((info) => info.name).join(', ')}
              </PayersContainer>
            </div>

            <MultiMeetingDetailContainer style={{ overflow: 'auto' }}>
              <div style={{ width: '100%', display: 'flex' }}>
                <RowItemHeader>결제자명</RowItemHeader>
                <RowItemHeader>금액</RowItemHeader>
                <RowItemHeader>은행정보</RowItemHeader>
                <LongRowItemHeader>계좌번호 및 송금하기</LongRowItemHeader>
              </div>

              {payerInfos.map((info, index) => (
                <RowItem
                  key={index}
                  payerName={info.name}
                  amount={info.shareAmount}
                  bankInfo={info.bank}
                  accountNum={info.accountNum}
                />
              ))}

            </MultiMeetingDetailContainer>
            <BigNextButton style={{ margin: '40px 0px ' }}>다음으로</BigNextButton>
          </MultiMeetingDetailInfo>

        </div>
      </div>
    </SingleDetailContainer>
  );
}