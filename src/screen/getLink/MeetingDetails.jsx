import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import {
  SingleDetailContainer,
  SingleDetailText,
  Transferbutton,
  StyledCopyIcon,
  MeetingDetailInfo,
  BankSelect,
  BankOption,
  TransferSection,
  MeetingNameText,
  ReceiplBox
} from '../../styles/styledComponents';

const bankUrlSchemes = {
  '토스': 'supertoss://send',
  '국민': 'kbbank://send',
  '카카오뱅크': 'kakaobank://send',
  '신한': 'shinhan-sr-ansimclick://send',
  '농협': 'nhallonepayansimclick://send'
};

function MeetingDetails() {
  const { link } = useParams();
  const navigate = useNavigate();
  const [meetingData, setMeetingData] = useState(null);
  const [selectedBank, setSelectedBank] = useState('토스');
  const [transferInitiated, setTransferInitiated] = useState(false);

  const handleBankChange = (event) => {
    setSelectedBank(event.target.value);
  };

  const handleTransferClick = () => {
    const urlScheme = bankUrlSchemes[selectedBank];
    if (urlScheme) {
      setTransferInitiated(true);
      window.location.href = urlScheme;
    } else {
      alert('은행을 선택해주세요.');
    }
  };

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        const response = await axios.get(`https://umc.dutchtogether.com/api/meetings/${link}`);
        if (response.status === 200) {
          setMeetingData(response.data.data);
        } else {
          console.error('데이터를 가져오는 중 오류가 발생했습니다.');
        }
      } catch (err) {
        console.error('데이터를 가져오는 중 오류가 발생했습니다.', err);
      }
    };

    fetchMeetingData();
  }, [link]);

  useEffect(() => {
    const handleFocus = () => {
      if (transferInitiated) {
        navigate(`/check-detail/${link}`);
      }
    };

    if (transferInitiated) {
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [navigate, link, transferInitiated]);

  if (!meetingData) {
    return <div>Loading...</div>;
  }

  const finalAmount = Number((meetingData.total_amount / meetingData.num_people).toFixed(0)).toLocaleString();
  const totalamount = Number((meetingData.total_amount).toFixed(0)).toLocaleString()


  const handleCopy = () => {
    alert('계좌번호가 복사되었습니다!');
  };

  return (
    <SingleDetailContainer>
      <MeetingNameText>
        <h1>{`${meetingData.meetingName}`}</h1>
        <SingleDetailText>의 정산 요청이 왔습니다.</SingleDetailText>
      </MeetingNameText>

      <div style={{ display: 'flex' }}>
        <MeetingDetailInfo>
          <div style={{ display: "flex", gap: " 50px" }}>
            <div>
              <p>정산금액</p>
              <SingleDetailText>{`${totalamount}원`}</SingleDetailText>
            </div>

            <div>
              <p>정산 인원</p>
              <SingleDetailText>{`${meetingData.num_people}명`}</SingleDetailText>
            </div>
          </div>

          <p>최종금액</p>
          <SingleDetailText>{`${finalAmount}원`}</SingleDetailText>
          <SingleDetailText>
            {`${meetingData.bank} ${meetingData.account_num}`}
            <CopyToClipboard text={meetingData.account_num} onCopy={handleCopy}>
              <StyledCopyIcon icon={faCopy} />
            </CopyToClipboard>
          </SingleDetailText>
          <SingleDetailText>[{meetingData.payer}]에게 최종금액을 송금하세요.</SingleDetailText>

          <TransferSection>
            <BankSelect id="bank-select" value={selectedBank} onChange={handleBankChange}>
              <BankOption value="">--은행 선택--</BankOption>
              {Object.keys(bankUrlSchemes).map((bank) => (
                <BankOption key={bank} value={bank}>{bank}</BankOption>
              ))}
            </BankSelect>
            <Transferbutton onClick={handleTransferClick}>[{`${meetingData.bank} ${meetingData.account_num}`}]로 송금하기</Transferbutton>
          </TransferSection>
        </MeetingDetailInfo>

        <ReceiplBox>
          영수증
          <div style={{ backgroundColor: 'white', marginTop: '10px' }}>
            영수증 들어올 자리
          </div>
        </ReceiplBox>
      </div>
    </SingleDetailContainer>
  );
}

export default MeetingDetails;
