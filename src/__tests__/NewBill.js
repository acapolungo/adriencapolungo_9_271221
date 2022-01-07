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

const newBill = {
  email: 'test@email.com',
  type: 'Flight',
  name:  'JohnDoe',
  amount: 10,
  date: '07/07/2077',
  vat: 5.5,
  pct: 10,
  commentary: 'mon commentaire',
  fileUrl: 'https://fr.wikipedia.org/wiki/Fichier:Google_%22G%22_Logo.svg',
  fileName: 'Logo de google',
  status: 'pending'
}

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
  let newcontentBill;
  beforeAll(() => {
    const html = NewBillUI()
    document.body.innerHTML = html;

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "yoann@bdl.com",
        password: "azerty",
        status: "connected",
      })
    );

    // build user interface before
    newcontentBill = new NewBill({ document, onNavigate, store: null, localStorage });
  });

  describe('When I am on the NewBill ', () => {
    test("Then the file name should be found in the input", () => {
      // Mock function handleChangeFile
      const handleChangeFile = jest.fn(newcontentBill.handleChangeFile);

      // console.log(prettyDOM(document, 20000));
      const inputFile = screen.getByTestId('file');
      inputFile.addEventListener('change', handleChangeFile);

      fireEvent.change(inputFile, {
        target: {
          files: [new File(["bill-image"], "bill-image.jpg", { type: "image/jpg" })],
        },
      })
      expect(handleChangeFile).toBeCalled();
      expect(inputFile.files[0].name).toBe("bill-image.jpg");
    });
  })

  describe('When I am on the NewBill ', () => {
    test("Then the wrong file type should return an error msg", () => {
      // Mock function handleChangeFile
      const handleChangeFile = jest.fn(newcontentBill.handleChangeFile);

      // console.log(prettyDOM(document, 20000));
      const inputFile = screen.getByTestId('file');
      inputFile.addEventListener('change', handleChangeFile);

      fireEvent.change(inputFile, {
        target: {
          files: [new File(["bill-image"], "bill-image.pdf", { type: "image/pdf" })],
        },
      })
      // HTML must contain 'hideErrorMessage'
      expect(inputFile.files[0].name).toBe("bill-image.pdf");
      expect(screen.getByTestId("file-error")).toHaveClass('file__error--on');
    });
  })

  describe('When I am on the NewBill ', () => {
    test("Then it should create a new bill", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Build user interface
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init newBill
      const newcontentBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // mock of handleSubmit
      const handleSubmit = jest.fn(newcontentBill.handleSubmit);

      // get the form and addEvent Submit
      const btnSubmit = screen.getByTestId('form-new-bill');
      btnSubmit.addEventListener('submit', handleSubmit);
      fireEvent.submit(btnSubmit);

      // handleSubmit function must be called
      expect(handleSubmit).toHaveBeenCalled();
    });
  })
});

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Dashboard employee", () => {
    test("Then fetches bills from mock API POST", async () => {
      const postSpy = jest.spyOn(store, "post")
      const bills = await store.post(newBill)
      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(1)
    })
    test("add bill to API and fails with 404 message error", async () => {
      store.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404")))
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy();
    })
    test("add bill to API and fails with 500 message error", async () => {
      store.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500")))
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    });
  })
})