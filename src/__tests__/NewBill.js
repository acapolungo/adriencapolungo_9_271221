/**
 * @jest-environment jsdom
 */

 import '@testing-library/jest-dom'

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from '@testing-library/user-event';
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
      //const pathname = ROUTES_PATH['NewBill'] 
      window.location.assign(ROUTES_PATH['NewBill']);
      document.body.innerHTML = `<div id="root"></div>`;

      // Router init to get actives CSS classes
      await Router();

      //console.log(document.body.innerHTML)
      // to-do write expect expression
      // "icon-mail" must contain the class "active-icon"
      expect(screen.getByTestId("icon-mail")).toHaveClass('active-icon');
    })
  })
})