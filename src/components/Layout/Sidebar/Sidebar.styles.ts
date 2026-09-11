import styled from 'styled-components';

export const SidebarContainer = styled.aside`
    width: 260px;
    min-width: 260px;
    height: 100vh;
    background-color: #FFFFFF;
    border-right: 1px solid #E2E8F0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px 14px;
    box-sizing: border-box;
`;

export const SidebarTop = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
    flex: 1;
`;

export const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 8px;
    border-bottom: 1px solid #F1F5F9;
    padding-bottom: 16px;
`;

export const AvatarWrapper = styled.div`
    width: 42px;
    height: 42px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 2px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F8FAFC;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

export const InfoWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
    overflow: hidden;
`;

export const UserName = styled.p`
    font-size: 14px;
    font-weight: 600;
    color: #0F172A;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const UserRole = styled.p`
    font-size: 12px;
    color: #64748B;
    margin: 0;
    font-weight: 500;
`;

export const Menu = styled.nav`
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #E2E8F0;
        border-radius: 4px;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    li {
        margin: 0;
        padding: 0;
    }

    a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        border-radius: 8px;
        color: #64748B;
        font-size: 13.5px;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.15s ease-in-out;

        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        &:hover {
            background-color: #EFF6FF;
            color: #2563EB;
        }

        &.active {
            background-color: #2563EB;
            color: #FFFFFF;
            font-weight: 600;
        }
    }
`;

export const SidebarBottom = styled.div`
    padding-top: 12px;
    border-top: 1px solid #F1F5F9;
`;

export const LogoutButton = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 12px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #EF4444;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease-in-out;

    &:hover {
        background-color: #FEF2F2;
    }
`;