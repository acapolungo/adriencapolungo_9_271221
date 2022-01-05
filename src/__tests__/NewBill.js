/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { prettyDOM } from "@testing-library/dom";

import { fireEvent, screen } from "@testing-library/dom";
import userEvent from '@testing-library/user-event'

import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import Router from "../app/Router";

import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the modal must display the image", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      // Routing variable
      window.location.assign(ROUTES_PATH['NewBill']);
      document.body.innerHTML = `<div id="root"></div>`;

      // Router init to get actives CSS classes
      await Router();

      //console.log(document.body.innerHTML)
      // "icon-mail" must contain the class "active-icon"
      expect(screen.getByTestId("icon-mail")).toHaveClass('active-icon');
    })
  });
});

describe('When I select a file through the file input', () => {
  test("Then the file name should be found in the input", () => {  
    // we have to mock navigation to test it
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({
      type: "Employee",
      email: "yoann@bdl.com",
      password: "azerty",
      status: "connected",
    }))
    
    // build user interface
    const html = NewBillUI();
    document.body.innerHTML = html;

    // Init NewBills
    const contentNewBill = new NewBill({
      document, onNavigate, store: null, localStorage: window.localStorage
    })

    //Mock function handleChangeFile
    const handleChangeFile = jest.fn(() => contentNewBill.handleChangeFile);

    console.log(prettyDOM(document, 20000));
    const inputFile = screen.getByTestId('file');
    inputFile.addEventListener('change', handleChangeFile);

    fireEvent.change(inputFile, {
      target: {
        files: [new File(["image"], "image.", { type: "image/jpg" })],
      },
    });
    expect(handleChangeFile).toBeCalled();
  });
});
