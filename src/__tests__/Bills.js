/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { prettyDOM } from "@testing-library/dom";

import { screen, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import Router from "../app/Router";

import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      // Routing variable
      // const pathname = ROUTES_PATH['Bills']
      window.location.assign(ROUTES_PATH['Bills']);
      document.body.innerHTML = `<div id="root"></div>`;

      // Router init to get actives CSS classes
      await Router();
      //console.log(document.body.innerHTML)
      // to-do write expect expression
      // "icon-window" must contain the class "active-icon"
      expect(screen.getByTestId("icon-window")).toHaveClass('active-icon');
    })

    test("Then bills should be ordered from earliest to latest", () => {
      // construct user interface
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      //console.log(html)
      //Get text from HTML
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      //console.log(dates)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      // dates must be equal to datesSorted
      expect(dates).toEqual(datesSorted);
    })
  })
})

// handleClickNewBill for container/Bills.js
describe('When I click on new bill button', () => {
  test('Then, it should render NewBill page', () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    }
    // build user interface
    const html = BillsUI({ data: bills[0]});
    document.body.innerHTML = html;
    //console.log(html);
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    
    // Init Bills
    const contentBill = new Bills({
      document, onNavigate, store: null, localStorage: window.localStorage
    })

    // Mock handleClickNewBill
    const handleClickNewBill = jest.fn((e) => contentBill.handleClickNewBill(e)); 
    const btnNewBill = screen.getByTestId('btn-new-bill');
    // Add event
    btnNewBill.addEventListener('click', handleClickNewBill);
    userEvent.click(btnNewBill)

    // screen should called handleClickNewBill, and display new bill form
    expect(handleClickNewBill).toHaveBeenCalled();
    expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
  })
});

describe('When I click on eye icon', () => {
  test('Then it should open the bill modal with corresponding content', () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    // build user interface
    const html = BillsUI({ data: bills });
    document.body.innerHTML = html;

    // Init Bills
    const contentBill = new Bills({
      document, onNavigate, store: null, localStorage: window.localStorage
    })

    // Mock modal comportment
    $.fn.modal = jest.fn();

    // Get button eye in DOM
    const eye = screen.getAllByTestId('icon-eye')[0];
    const handleClickIconEye = jest.fn((e) => contentBill.handleClickIconEye(eye)); 

    // Add event and click
    eye.addEventListener('click', handleClickIconEye)
    userEvent.click(eye)

    // handleClickIconEye function must be called
    expect(handleClickIconEye).toHaveBeenCalled()
    //console.log(prettyDOM(document, 20000));
    const modale = document.getElementById('modaleFile')
    expect(modale).toBeTruthy()
  })
})

// test d'intégration GET Bills
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(store, "get")
       // Get bills and the new bill
       const bills = await store.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       // The number of bills must be 4
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      // user interface BillsUi with error code
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      // waiting for the error message 400
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      // user interface BillsUi with error code
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      // waiting for the error message 500
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})