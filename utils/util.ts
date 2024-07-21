export const iconOptions = [
  { value: "0", src: "/icons/guest.png", label: "guest" },
  { value: "1", src: "/icons/skateboard.png", label: "skater" },
  { value: "2", src: "/icons/hip-hop.png", label: "dancer" },
  { value: "3", src: "/icons/bmx.png", label: "rider" },
  { value: "4", src: "/icons/wall.png", label: "parkour-traceur" },
  { value: "5", src: "/icons/kendama.png", label: "kendama-player" },
  { value: "6", src: "/icons/paint-roller.png", label: "painter" },
  { value: "7", src: "/icons/user-avatar.png", label: "writer" },
  { value: "8", src: "/icons/video-camera.png", label: "filmer" },
  { value: "9", src: "/icons/binary-code.png", label: "editor" },
  { value: "10", src: "/icons/wave-sound.png", label: "musician" },
  { value: "11", src: "/icons/tank-top.png", label: "fashion-designer" },
  { value: "12", src: "/icons/man.png", label: "organizer" },
];

export function genreNumberToObject(genre: number) {
  const genre_str = genre.toString();

  try {
    const icon = iconOptions.find((option) => option.value === genre_str);

    return icon?.src;
  } catch (err) {
    console.error("genre icon not get", err);
    return null;
  }
}

export function base64ToBlob(base64: any, mimeType: any) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: mimeType });
}
