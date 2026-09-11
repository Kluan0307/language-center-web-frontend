import * as S from './Overview.styles';
import Sidebar from '../../components/Layout/Sidebar';

function Overview() {

    return (
        <S.OverviewContainer>
            <Sidebar />
            <S.MainContent>
                <p>Đây là overview</p>
            </S.MainContent>
        </S.OverviewContainer>
    );
}

export default Overview;
