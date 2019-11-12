/* @flow */


export default (src) => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.setAttribute('src', src);
  document.body.appendChild(iframe);

  return iframe;
};
