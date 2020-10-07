@cvss/react
===========
This package is part of the Cortex Video Services Web SDK and contains 
components built to help develop web applications based on the [React framework] 
that use Cortex Video Services for video calling and video conferencing. 
This package is developing and maintained with the support and assistance 
of [Cortex Technology].

The package contains a set of components for the [React framework] to implement 
the full functionality of video calls in web applications written in **javascript** 
and **typescript**.

Table of components
-------------------
|Component|Function|
|---|---|
|Session|This is root of the component hierarchy define video session. Has event handlers.|
|Publisher|This component defines what are you publishing. And also it is context for the local stream. Has event handlers.|
|LocalStream|This component implements a local stream, in other words, it displays the video stream that you are publishing.|
|Incoming|This component implements the controller of incoming video calls. Its child component will be cloned based on the number of incoming.|
|RemoteStream|This component implements a remote (incoming video) stream.|
|Video|Adapted HTML video tag.|

See the hierarchy diagram.
```text
        / Publisher - LocalStream - Video
Session 
        \ Incoming  - RemoteStream - Video
                    \  ...
                       RemoteStream - Video
```
This option corresponds to `example #2`
The LocalStream and RemoteStream levels can be collapsed this corresponds to `example #1`
The Publisher and Incoming levels also can be collapsed this corresponds to `example #0`
Publisher, LocalStream, Incoming, RemoteStream if their level collapsed and Video always 
accepts attributes of video HTML tag

### example #0
```jsx
    <Session sessionId="SAMPLE0">
      <Publisher width={320} className="streamView" />
      <Incoming width={320} className="streamView" />
    </Session>
```
Also see file [Sample0.jsx] in sample project

### example #1
```jsx
    <Session sessionId="SAMPLE1">
      <Publisher>
        <div className="streamBox">
          <LocalStream width={320} className="streamView" />
        </div>
      </Publisher>
      <Incoming>
        <div className="streamBox">
          <RemoteStream width={320} className="streamView" />
        </div>
      </Incoming>
    </Session>
```
Also see file [Sample1.jsx] in sample project

### example #2
```jsx
    <Session sessionId={sessionId || 'SAMPLE2'} eventHandlers={sessionListener}>
      <Publisher eventHandlers={publisherListener}>
        <LocalStream>
          {({ stream, participantName }) => {
            return (
              <div className="streamBox">
                <h4 className="streamTitle">{participantName}</h4>
                <Video stream={stream} className="streamView" />
              </div>
            );
          }}
        </LocalStream>
      </Publisher>
      <Incoming clone={true}>
        <RemoteStream>
          {({ stream, participantName, muted, setMuted }) => (
            <div className="streamBox">
              <h4 className="streamTitle" onClick={() => setMuted(!muted)}>{participantName}</h4>
              <Video stream={stream} className="streamView" muted={muted} />
            </div>
          )}
        </RemoteStream>
      </Incoming>
    </Session>

```
Also see file [Sample2.jsx] in sample project


Other samples
-------------
In this mono-repository you can find easy-to-understand examples of applications 
written in javascript - [jsample] and in typescript - [tsample].

[Cortex Technology]: http://cb.technology/
[React framework]: https://reactjs.org/
[Sample0.jsx]: ../../samples/jsample/src/Sample0.jsx
[Sample1.jsx]: ../../samples/jsample/src/Sample1.jsx
[Sample2.jsx]: ../../samples/jsample/src/Sample2.jsx
[jsample]: ../../samples/jsample
[tsample]: ../../samples/tsample