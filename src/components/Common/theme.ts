export const theme = {
    colors: {
        primary: '#2563EB',
        primaryHover: '#1D4ED8',
        lightBg: '#EFF6FF',
        border: '#BFDBFE',
        borderLight: '#E2E8F0',
        disabled: '#93C5FD',
        text: '#1F2937',
        textSecondary: '#64748B',
        white: '#FFFFFF',
        rowHover: '#F8FAFC',
        shadow: 'rgba(37, 99, 235, 0.15)',
    },
    borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
    },
    transitions: {
        default: 'all 0.2s ease-in-out',
    },
};

export const managementTheme = {token:{colorPrimary:theme.colors.primary,colorSuccess:'#059669',colorWarning:'#D97706',colorError:'#DC2626',colorInfo:theme.colors.primary,colorText:theme.colors.text,colorTextSecondary:theme.colors.textSecondary,colorBorder:'#E2E8F0',colorBgLayout:'#F8FAFC',borderRadius:8,fontSize:14,fontFamily:'inherit',controlHeight:36},components:{Table:{headerBg:'#F8FAFC',headerColor:'#475569',cellPaddingBlock:14},Card:{borderRadiusLG:12},Button:{primaryShadow:'none'}}};
