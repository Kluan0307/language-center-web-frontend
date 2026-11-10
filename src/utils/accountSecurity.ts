export function passwordError(password:string):string|undefined {
 if(!password||!password.trim())return 'Nhập mật khẩu mới.';
 if(password.length<8)return 'Mật khẩu phải có ít nhất 8 ký tự.';
 if(new TextEncoder().encode(password).length>72)return 'Mật khẩu không được vượt 72 byte UTF-8.';
 return undefined;
}
export const PASSWORD_REFRESH_EVENT='language-center:refresh-session';
