import { Repeat, Range } from "../src";
import { Component, createSignal, onCleanup } from "solid-js";
import { render } from "solid-js/web";
import { TransitionGroup } from "solid-transition-group";
import "uno.css";
import { createStore } from "solid-js/store";

const Ball = (props: { n: number }) => (
  <div class="w-4 h-4 center-child rounded-full bg-cyan-500 transition-all duration-500">
    {props.n}
  </div>
);
const Fallback = () => <div class="p-2 bg-gray-600 transition-all duration-500">fallback</div>;

const App: Component = () => {
  const [state, setState] = createStore({
    start: 0,
    to: 0,
    step: 0.5
  });

  const shuffle = () => {
    // const start = 0;
    // const to = 3
    // const step = 0.5;
    const start = Math.round(Math.random() * 8 - 4);
    const to = Math.round(Math.random() * 8 + 12);
    const step = Math.round(Math.random() * 4);
    setState({ start, to, step });
  };

  // const [state, setState] = createStore({
  //   start: 0,
  //   to: -5,
  //   step: -0.5
  // });

  // const shuffle = () => {
  //   // const start = -2
  //   // const to = 3
  //   const step = -0.5;
  //   const start = Math.round(Math.random() * 5 + 5);
  //   const to = Math.round(Math.random() * 5 - 5);
  //   // const step = +(Math.random() * 2).toFixed(1)
  //   setState({ start, to, step });
  // };

  // const i = setInterval(shuffle, 6000);
  // onCleanup(() => clearInterval(i));

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>
          Start: {state.start}, To: {state.to}, Step: {state.step}
        </h4>
        <div>
          <button class="btn" onclick={shuffle}>
            shuffle
          </button>
        </div>
        <h4>Repeat component</h4>
        <div class="flex space-x-2">
          <TransitionGroup name="fade">
            <Repeat times={state.to} fallback={<Fallback />}>
              {n => <Ball n={n} />}
            </Repeat>
          </TransitionGroup>
        </div>
        <h4>Range component</h4>
        <div class="flex space-x-2">
          <TransitionGroup name="fade">
            <Range start={state.start} to={state.to} step={state.step} fallback={<Fallback />}>
              {n => <Ball n={n} />}
            </Range>
          </TransitionGroup>
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
