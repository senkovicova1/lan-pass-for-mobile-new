import React, {
  useEffect
} from 'react';

export default function Reroute( props ) {

  useEffect(() => {
    if (props.match.path === "/"){
      props.history.push("/folders/list/all");
    }
  }, [props.match.path]);

  return (<div style={{display: "none"}}></div>);
};
