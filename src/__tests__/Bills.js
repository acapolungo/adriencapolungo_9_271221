/**
 * @jest-environment jsdom
 */

 import '@testing-library/jest-dom'

 import {
   getByTestId
 } from '@testing-library/dom'

// 
import {localStorageMock } from "../__mocks__/localStorage.js";

import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      // to-do write expect expression
      // simuler un path du router
      // expect(screen.getByTestId(document.body, 'icon-window')).toHaveClass('active-icon').toBeTruthy();
    })
    test("Then bills should be ordered from earliest to latest", () => {
      // construct user interface
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      // console.log(html)
      // Get text from HTML
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      // dates must be equal to datesSorted
      expect(dates).toEqual(datesSorted)
    })
  })
})