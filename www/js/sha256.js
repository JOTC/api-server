function SHA256(o){function e(c,b){var d=(c&65535)+(b&65535);return(c>>16)+(b>>16)+(d>>16)<<16|d&65535}function g(c,b){return c>>>b|c<<32-b}o=function(c){c=c.replace(/\r\n/g,"\n");for(var b="",d=0;d<c.length;d++){var a=c.charCodeAt(d);if(a<128)b+=String.fromCharCode(a);else{if(a>127&&a<2048)b+=String.fromCharCode(a>>6|192);else{b+=String.fromCharCode(a>>12|224);b+=String.fromCharCode(a>>6&63|128)}b+=String.fromCharCode(a&63|128)}}return b}(o);return function(c){for(var b="",d=0;d<c.length*4;d++)b+="0123456789abcdef".charAt(c[d>>2]>>(3-d%4)*8+4&15)+"0123456789abcdef".charAt(c[d>>2]>>(3-d%4)*8&15);return b}(function(c,b){var d=new Array(1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298),a=new Array(1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225),h=new Array(64),i,k,l,p,j,m,n,q,r,f,s,t;c[b>>5]|=128<<24-b%32;c[(b+64>>9<<4)+15]=b;for(r=0;r<c.length;r+=16){i=a[0];k=a[1];l=a[2];p=a[3];j=a[4];m=a[5];n=a[6];q=a[7];for(f=0;f<64;f++){h[f]=f<16?c[f+r]:e(e(e(g(h[f-2],17)^g(h[f-2],19)^h[f-2]>>>10,h[f-7]),g(h[f-15],7)^g(h[f-15],18)^h[f-15]>>>3),h[f-16]);s=e(e(e(e(q,g(j,6)^g(j,11)^g(j,25)),j&m^~j&n),d[f]),h[f]);t=e(g(i,2)^g(i,13)^g(i,22),i&k^i&l^k&l);q=n;n=m;m=j;j=e(p,s);p=l;l=k;k=i;i=e(s,t)}a[0]=e(i,a[0]);a[1]=e(k,a[1]);a[2]=e(l,a[2]);a[3]=e(p,a[3]);a[4]=e(j,a[4]);a[5]=e(m,a[5]);a[6]=e(n,a[6]);a[7]=e(q,a[7])}return a}(function(c){for(var b=Array(),d=0;d<c.length*8;d+=8)b[d>>5]|=(c.charCodeAt(d/8)&255)<<24-d%32;return b}(o),o.length*8))};