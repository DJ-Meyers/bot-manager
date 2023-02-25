
export interface AuthEnabledComponentConfig {
    authenticationEnabled: boolean;
}

export type ComponentWithAuth<PropsType = any> = React.FC<PropsType> &
    AuthEnabledComponentConfig;