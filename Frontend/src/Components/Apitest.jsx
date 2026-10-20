import React from 'react'
import { useEffect } from 'react'


function Apitest() {
  const [data, setData] = React.useState(null);
    useEffect(() => {
        fetch('https://linkpulse-1-e09g.onrender.com/auth/getuser', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
              console.log(data);
              setData(data);
            })
            .catch(error => console.error(error));
    },[])

  return (
    <div>
      <div className="">
        <h1>API Test</h1>
        {data ? (
          <div>
            <h2>Data from API:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        ) : (
          <p>Loading data...</p>
        )}
      </div>
    </div>
  )
}

export default Apitest
