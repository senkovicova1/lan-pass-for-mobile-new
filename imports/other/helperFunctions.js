export const isEmail = ( email ) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email,
  );

export const uint8ArrayToImg = ( arr ) => {
  const blob = new Blob( [ arr ], {
    type: "image/jpeg"
  } );
  const img = URL.createObjectURL( blob );
  return img;
};