/* eslint-disable no-undef */
import React from 'react'

export const GenerateDiffErrors = ()=>{
    return (
        <>
              <button
        onClick={() => {
          const x = null;
          x();
        }}
      >
        Generate a Type Error
      </button>
      <br/><br/>
      <button
        onClick={() => {
          const x = undefined;
          console.log(y);
        }}
      >
        Generate a Reference Error
      </button>
      <br/>
      <br/>
      <button
        onClick={() => {
          const doc = document.getElementById('about-us');
          document.body.removeChild(doc);
        }}
      >
        Generate a DOM Error
      </button>
      <br/>
      <br/>
      <button
        onClick={() => {
          const myProm = () => Promise.reject('rejecting');
          console.log('failing a promise');
          myProm();
        }}
      >
        Generate a Async Error
      </button>
        </>
    )
}