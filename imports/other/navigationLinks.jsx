
export const login = "/login";

export const listFolders = "/folders";
export const addFolder = "/folders/add";

export const editFolder = "/folders/edit/:folderID";
export const editFolderStart = "/folders/edit/";

export const listPasswordsInFolder = "/folders/list/:folderID";
export const listPasswordsInFolderStart = "/folders/list/";
export const listDeletedPasswordsInFolder = "/folders/list/:folderID/deleted";

export const deletedFolders = "/folders/deleted";

export const editCurrentUser = "/user/edit/";

export const addPassword = "/folders/:folderID/password-add";
export const editPassword = "/folders/:folderID/:passwordID/edit";
export const viewPassword = "/folders/:folderID/:passwordID";
export const viewPreviousPassword = "/folders/:folderID/version/:passwordID";
export const viewPasswordStart = "/folders/";
export const passwordHistory = "/folders/:folderID/:passwordID/history";
