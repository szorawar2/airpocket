export type FileItem = {
  original_file_name: string;
  file_name: string;
  file_id: number;
  burn: boolean;
};

export type Message = {
  batch_id: number;
  text: string | null;
  files: FileItem[];
};

export type MessageDTO = {
  batch_id: number;
  ciphertext: string | null;
  iv: string | null;
  files: FileItem[];
};
